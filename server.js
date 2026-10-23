import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ESQUEMA, GENEROS, TAMANHOS, TEXTO_ABERTURA, montarPrompt } from './narradora.js';
import { AVARN, textoCanonicoAvarn } from './lore.js';

const PORTA = Number(process.env.PORT) || 3000;
const PROVEDOR_IA = (process.env.PROVEDOR_IA || 'ollama').toLowerCase();
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const MODELO = process.env.MODELO || 'llama3.1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODELO = process.env.GEMINI_MODELO || 'gemini-3.8-flash';
// Tamanho da "memória de curto prazo" do modelo, em tokens. Mais memória usa mais RAM.
const CONTEXTO = Number(process.env.CONTEXTO) || 8192;
const aqui = path.dirname(fileURLToPath(import.meta.url));
const ARQUIVO_SALVO = path.join(aqui, 'partida-salva.json');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(aqui, 'public')));
app.get('/api/lore', (_req, res) => res.json(AVARN));

/* ---------- partidas (ficam na memória; reiniciar o servidor apaga todas) ---------- */

const partidas = new Map();
const MAX_PARTIDAS = 50;
let partidaAtualId = null;

function persistirPartidas() {
  try {
    fs.writeFileSync(ARQUIVO_SALVO, JSON.stringify({ partidaAtualId, partidas: [...partidas.entries()] }, null, 2), 'utf8');
  } catch (e) { console.error('[salvamento] Não consegui salvar a partida:', e.message); }
}

try {
  if (fs.existsSync(ARQUIVO_SALVO)) {
    const salvo = JSON.parse(fs.readFileSync(ARQUIVO_SALVO, 'utf8'));
    for (const [id, partida] of (salvo.partidas || [])) {
      partida.id = id; partida.ocupada = false; partida.salvamentosManuais ||= [];
      partida.criadaEm ||= new Date().toISOString(); partida.atualizadaEm ||= partida.criadaEm;
      partida.nomeAventura ||= `Aventura ${temaLegivel(partida.opcoes?.genero)}`;
      partidas.set(id, partida);
    }
    partidaAtualId = salvo.partidaAtualId && partidas.has(salvo.partidaAtualId) ? salvo.partidaAtualId : null;
    if (partidaAtualId) console.log('Partida salva carregada automaticamente.');
  }
} catch (e) { console.warn('[salvamento] O arquivo salvo não pôde ser carregado:', e.message); }

// MEMÓRIA COMPARTILHADA: resumo + estado atual + mensagens recentes ficam no save do jogo.
// Gemini e Ollama recebem esse mesmo conjunto; a memória não depende da sessão interna de nenhum modelo.
// Quando o histórico passa de LIMITE mensagens, as mais antigas viram um resumo.
// Os valores são baixos de propósito: modelos locais têm pouca memória de curto prazo.
const LIMITE_MENSAGENS = 16;
const MANTER_MENSAGENS = 6;

class ErroNarradora extends Error {
  constructor(mensagem, status = 502) {
    super(mensagem);
    this.status = status;
  }
}

function registrar(partida) {
  const id = randomUUID();
  partida.id = id;
  partida.criadaEm ||= new Date().toISOString();
  partida.atualizadaEm = new Date().toISOString();
  partida.salvamentosManuais ||= [];
  partidas.set(id, partida);
  partidaAtualId = id;
  persistirPartidas();
  return id;
}

function atualizarPartida(partidaId, partida) {
  partida.atualizadaEm = new Date().toISOString();
  partidas.set(partidaId, partida);
  persistirPartidas();
}

function snapshotPartida(partida) {
  return JSON.parse(JSON.stringify({
    opcoes: partida.opcoes,
    ficha: partida.ficha || null,
    mensagens: partida.mensagens,
    resumo: partida.resumo,
    estado: partida.estado,
    fim: partida.fim,
    turnos: partida.turnos || [],
    ultimoTurno: partida.ultimoTurno
  }));
}

function temaLegivel(genero) {
  return ({ fantasia: 'Fantasia', terror: 'Terror', scifi: 'Ficção científica', misterio: 'Mistério' })[genero] || 'Fantasia';
}

function resumoAventura(id, partida) {
  return {
    id,
    nome: partida.nomeAventura || `Aventura ${temaLegivel(partida.opcoes?.genero)}`,
    tema: partida.opcoes?.genero || 'fantasia',
    temaLegivel: temaLegivel(partida.opcoes?.genero),
    personagem: partida.opcoes?.nome || 'Aventureiro',
    local: partida.estado?.local || 'Ainda não definido',
    vida: partida.estado?.vida ?? 10,
    fim: Boolean(partida.fim),
    criadaEm: partida.criadaEm || null,
    atualizadaEm: partida.atualizadaEm || partida.criadaEm || null,
    quantidadeTurnos: (partida.turnos || []).length,
    quantidadeSalvamentos: (partida.salvamentosManuais || []).length
  };
}

function limparTexto(valor, max) {
  return String(valor ?? '')
    .replace(/[<>\r\n]/g, ' ')
    .trim()
    .slice(0, max);
}

function limparOpcoes(o) {
  o = o && typeof o === 'object' ? o : {};
  return {
    nome: limparTexto(o.nome, 30),
    genero: Object.hasOwn(GENEROS, o.genero) ? o.genero : 'fantasia',
    respostas: Object.hasOwn(TAMANHOS, o.respostas) ? o.respostas : 'medias'
  };
}

/* ---------- provedores de IA: Ollama local ou Gemini API ---------- */

// Chama o Ollama e devolve o texto completo da resposta.
// Usa streaming por dentro só para a conexão não expirar em computadores lentos.
async function chamarOllama({ system, mensagens, maxTokens, formato, temperatura }) {
  let resposta;
  try {
    resposta = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10 * 60 * 1000),
      body: JSON.stringify({
        model: MODELO,
        stream: true,
        keep_alive: '30m',
        messages: [{ role: 'system', content: system }, ...mensagens],
        ...(formato ? { format: formato } : {}),
        options: { temperature: temperatura, num_ctx: CONTEXTO, num_predict: maxTokens }
      })
    });
  } catch (e) {
    if (e?.name === 'TimeoutError') {
      throw new ErroNarradora('A narradora demorou demais para responder. Tente de novo ou use um modelo menor.');
    }
    throw new ErroNarradora(
      'Não consegui falar com o Ollama. Veja se ele está aberto (abra o aplicativo do Ollama ou rode "ollama serve" no terminal).',
      503
    );
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    const detalhe = String(corpo.error || '');
    console.error('[ollama]', resposta.status, detalhe);
    if (resposta.status === 404 || /not found/i.test(detalhe)) {
      throw new ErroNarradora(`O modelo "${MODELO}" não está instalado. No terminal, rode: ollama pull ${MODELO}`);
    }
    throw new ErroNarradora('O Ollama devolveu um erro. Veja o terminal do servidor para mais detalhes.');
  }

  let texto = '';
  let sobra = '';
  const decodificador = new TextDecoder();

  function processar(linha) {
    linha = linha.trim();
    if (!linha) return;
    const obj = JSON.parse(linha);
    if (obj.error) throw new ErroNarradora('O Ollama parou no meio da resposta: ' + obj.error);
    texto += obj.message?.content ?? '';
  }

  try {
    for await (const pedaco of resposta.body) {
      sobra += decodificador.decode(pedaco, { stream: true });
      let i;
      while ((i = sobra.indexOf('\n')) >= 0) {
        processar(sobra.slice(0, i));
        sobra = sobra.slice(i + 1);
      }
    }
    processar(sobra);
  } catch (e) {
    if (e instanceof ErroNarradora) throw e;
    console.error('[ollama] conexão caiu', e?.message ?? e);
    throw new ErroNarradora('A conexão com o Ollama caiu no meio da resposta. Tente de novo.');
  }

  return texto;
}

// A API do Gemini usa nomes de tipos em maiúsculas no responseSchema.
function esquemaGemini(esquema) {
  if (Array.isArray(esquema)) return esquema.map(esquemaGemini);
  if (!esquema || typeof esquema !== 'object') return esquema;
  const saida = {};
  for (const [chave, valor] of Object.entries(esquema)) {
    if (chave === 'type' && typeof valor === 'string') saida[chave] = valor.toUpperCase();
    else if (chave === 'properties' && valor && typeof valor === 'object') {
      saida[chave] = Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, esquemaGemini(v)]));
    } else saida[chave] = esquemaGemini(valor);
  }
  return saida;
}

async function chamarGemini({ system, mensagens, maxTokens, formato, temperatura }) {
  if (!GEMINI_API_KEY) {
    throw new ErroNarradora('A chave do Gemini não foi configurada. Adicione GEMINI_API_KEY ao arquivo .env ou mude PROVEDOR_IA para ollama.', 503);
  }

  const contents = mensagens.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content ?? '') }]
  }));
  const generationConfig = {
    temperature: temperatura,
    maxOutputTokens: maxTokens,
    ...(formato ? { responseMimeType: 'application/json', responseSchema: esquemaGemini(formato) } : {})
  };

  let resposta;
  try {
    resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODELO)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig
      })
    });
  } catch (e) {
    if (e?.name === 'TimeoutError') throw new ErroNarradora('O Gemini demorou demais para responder. Tente novamente em alguns instantes.');
    console.error('[gemini] falha de conexão:', e?.message ?? e);
    throw new ErroNarradora('Não consegui conectar à API do Gemini. Verifique sua internet e a configuração da API.', 503);
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const detalhe = String(dados.error?.message || '');
    console.error('[gemini]', resposta.status, detalhe);
    if (resposta.status === 400 || resposta.status === 403) {
      throw new ErroNarradora('O Gemini recusou a solicitação. Confira se a chave da API está correta, se o modelo está disponível e se a API está habilitada.');
    }
    if (resposta.status === 401) throw new ErroNarradora('A chave da API do Gemini é inválida. Confira GEMINI_API_KEY no arquivo .env.', 503);
    if (resposta.status === 429) throw new ErroNarradora('O limite de uso do Gemini foi atingido. Aguarde a renovação da cota ou mude PROVEDOR_IA para ollama.', 429);
    throw new ErroNarradora('O Gemini devolveu um erro. Veja o terminal do servidor para mais detalhes.');
  }

  const texto = (dados.candidates?.[0]?.content?.parts || []).map((parte) => parte.text || '').join('');
  if (!texto.trim()) {
    const motivo = dados.promptFeedback?.blockReason;
    throw new ErroNarradora(motivo ? `O Gemini bloqueou a solicitação (${motivo}). Tente reformular a ação.` : 'O Gemini não retornou texto. Tente novamente.');
  }
  return texto;
}

async function chamarNarradora(args) {
  if (PROVEDOR_IA === 'ollama') return chamarOllama(args);
  if (PROVEDOR_IA !== 'gemini') {
    throw new ErroNarradora('PROVEDOR_IA inválido. Use "ollama" ou "gemini" no arquivo .env.', 500);
  }

  // A memória pertence ao jogo, não ao provedor: os dois recebem exatamente
  // o mesmo prompt, resumo, estado atual e histórico da aventura.
  try {
    return await chamarGemini(args);
  } catch (erroGemini) {
    console.warn(`[fallback] Gemini falhou (${erroGemini?.status || 'sem status'}): ${erroGemini?.message || erroGemini}`);
    console.warn('[fallback] Tentando continuar a aventura com o Ollama usando a memória compartilhada...');

    try {
      const texto = await chamarOllama(args);
      console.warn('[fallback] Ollama respondeu. A aventura continuou com a memória central do jogo.');
      return texto;
    } catch (erroOllama) {
      console.error('[fallback] Gemini e Ollama falharam.', erroOllama?.message || erroOllama);
      // Preserva a informação do primeiro erro, mas explica que o narrador
      // alternativo também não está disponível.
      throw new ErroNarradora(
        `O Gemini não conseguiu responder e o Ollama também falhou. Gemini: ${erroGemini?.message || 'erro desconhecido'} Ollama: ${erroOllama?.message || 'erro desconhecido'}`,
        erroOllama?.status || erroGemini?.status || 503
      );
    }
  }
}

/* ---------- conversa com a narradora ---------- */

function lerJson(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    // às vezes o modelo coloca texto antes ou depois do JSON
    const ini = texto.indexOf('{');
    const fim = texto.lastIndexOf('}');
    if (ini >= 0 && fim > ini) {
      try {
        return JSON.parse(texto.slice(ini, fim + 1));
      } catch (e2) {}
    }
    return null;
  }
}

function textosValidos(lista, max) {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((t) => typeof t === 'string' && t.trim())
    .map((t) => t.trim())
    .slice(0, max);
}

// Confere o que veio do modelo antes de confiar nisso
function sanear(x, estadoAnterior = null) {
  if (!x || typeof x !== 'object') return null;
  const narracao = textosValidos(x.narracao, 8);
  if (narracao.length === 0) return null;

  const n = Number(x.vida);
  const vida = Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : (estadoAnterior?.vida ?? 10);
  const fim = x.fim === true || vida === 0;
  const opcoes = []; // A interface usa ações livres, não escolhas sugeridas pela IA.

  return {
    narracao,
    opcoes,
    vida,
    condicao: limparTexto(x.condicao, 160) || 'sem ferimentos relevantes',
    local: limparTexto(x.local, 40) || 'Lugar desconhecido',
    mochila: textosValidos(x.mochila, 20),
    diario: Array.isArray(x.diario) ? x.diario.slice(0, 4).map(n => ({ pasta: ['Personagens e NPCs','Missões e pistas','Lugares','Itens','Geral'].includes(n?.pasta) ? n.pasta : 'Geral', titulo: limparTexto(n?.titulo, 120), pontos: textosValidos(n?.pontos, 6).map(p => limparTexto(p, 240)).filter(Boolean) })).filter(n => n.titulo && n.pontos.length) : [],
    fim
  };
}

async function compactar(partida) {
  if (partida.mensagens.length <= LIMITE_MENSAGENS) return;

  const antigas = partida.mensagens.slice(0, partida.mensagens.length - MANTER_MENSAGENS);
  const recentes = partida.mensagens.slice(-MANTER_MENSAGENS);
  const texto = antigas
    .map((m) => (m.role === 'user' ? 'JOGADOR: ' : 'NARRADORA: ') + m.content)
    .join('\n\n');

  const resumo = (
    await chamarNarradora({
      system:
        'Você resume partidas de RPG de texto. Escreva em português, em no máximo 150 palavras, ' +
        'os fatos que importam para continuar a história: quem é o personagem, onde esteve, o que ' +
        'descobriu, itens importantes, aliados, inimigos, promessas e perigos em aberto. Sem comentários.',
      mensagens: [
        {
          role: 'user',
          content:
            (partida.resumo ? `Resumo anterior:\n${partida.resumo}\n\n` : '') +
            `Novos acontecimentos:\n${texto}`
        }
      ],
      maxTokens: 500,
      temperatura: 0.3
    })
  ).trim();

  if (resumo) {
    partida.resumo = resumo;
    partida.mensagens = recentes;
  }
}

async function narrar(partida, textoDoJogador) {
  await compactar(partida);

  const mensagens = [...partida.mensagens, { role: 'user', content: textoDoJogador }];

  const texto = await chamarNarradora({
    system: montarPrompt({ ...partida.opcoes, ficha: partida.ficha || null }, partida.resumo, partida.estado),
    mensagens,
    maxTokens: TAMANHOS[partida.opcoes.respostas].maxTokens,
    formato: ESQUEMA,
    temperatura: 0.8
  });

  const turno = sanear(lerJson(texto), partida.estado);
  if (!turno) {
    console.error('[narradora] resposta inválida:', texto.slice(0, 300));
    throw new ErroNarradora('A narradora respondeu num formato inesperado. Tente de novo.');
  }

  // Proteção determinística contra recuperação de vida sem causa narrada.
  // A narradora ainda decide os resultados, mas não pode restaurar vida por engano.
  const narrativaCompleta = turno.narracao.join(' ').toLocaleLowerCase('pt-BR');
  const houveRecuperacao = /cur(a|ou|ado|ada)|recuper(a|ou|ação|ado|ada)|descans(a|ou|o)|poção|tratamento|estanc(a|ou)|vida restaurada|energia restaurada/.test(narrativaCompleta);
  if (partida.estado && turno.vida > partida.estado.vida && !houveRecuperacao) {
    turno.vida = partida.estado.vida;
  }

  // Só guarda a jogada no histórico depois que deu certo
  partida.mensagens = [...mensagens, { role: 'assistant', content: JSON.stringify(turno) }];
  partida.estado = { vida: turno.vida, condicao: turno.condicao, local: turno.local, mochila: turno.mochila };
  partida.fim = turno.fim;
  partida.ultimoTurno = turno;
  return turno;
}

function paraCliente(turno, partidaId) {
  return {
    partidaId,
    narracao: turno.narracao,
    opcoes: turno.opcoes,
    fim: turno.fim,
    estado: {
      vida: `${turno.vida} / 10`,
      condicao: turno.condicao,
      local: turno.local,
      mochila: turno.mochila.length ? turno.mochila.join(', ') : 'vazia'
    }
  };
}

function responderErro(res, e) {
  console.error('[erro]', e?.message ?? e);
  if (e instanceof ErroNarradora) {
    return res.status(e.status).json({ erro: e.message });
  }
  res.status(500).json({ erro: 'A narradora não conseguiu responder. Tente de novo.' });
}

function limparRetrato(valor) {
  if (!valor || typeof valor !== 'object') return { tipo: 'emoji', valor: '🧙' };
  if (valor.tipo === 'emoji' && typeof valor.valor === 'string' && ['🧙','🧝','🧝‍♀️','🧔','🧑‍🎤','🛡️','🏹','🗡️','🧛','🧚','🐺','🐉'].includes(valor.valor)) {
    return { tipo: 'emoji', valor: valor.valor };
  }
  if (valor.tipo === 'imagem' && typeof valor.valor === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(valor.valor) && valor.valor.length <= 350000) {
    return { tipo: 'imagem', valor: valor.valor };
  }
  return { tipo: 'emoji', valor: '🧙' };
}

function limparFicha(valor) {
  if (!valor || typeof valor !== 'object') return null;
  const racas = { humanos: 'Humanos', elfos: 'Elfos', anoes: 'Anões', goblins: 'Goblins', orcs: 'Orcs', pequeninos: 'Pequeninos' };
  const classes = {
    guerreiro: 'Guerreiro', ladino: 'Ladino', mago: 'Mago', patrulheiro: 'Patrulheiro', paladino: 'Paladino'
  };
  const origens = {
    nobre: 'Nobre', orfao: 'Órfão', mercenario: 'Mercenário', aprendiz: 'Aprendiz', ex_criminoso: 'Ex-criminoso', viajante: 'Viajante'
  };
  const atributosValidos = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
  if (!racas[valor.raca] || !classes[valor.classe] || !origens[valor.origem]) return null;
  const nome = limparTexto(valor.nome, 40);
  if (!nome) return null;
  const historia = valor.historia && typeof valor.historia === 'object' ? valor.historia : {};
  const atributos = {};
  let total = 0;
  for (const chave of atributosValidos) {
    const n = Number(valor.atributos?.[chave]);
    if (!Number.isInteger(n) || n < 8 || n > 15) return null;
    atributos[chave] = n;
    total += n <= 13 ? n - 8 : 5 + (n - 13) * 2;
  }
  if (total > 27) return null;
  return {
    versao: 1,
    nome,
    idade: limparTexto(valor.idade, 3),
    genero: limparTexto(valor.genero, 30),
    aparencia: limparTexto(valor.aparencia, 500),
    raca: valor.raca,
    racaNome: racas[valor.raca],
    racaLore: limparTexto(valor.racaLore, 1000),
    retrato: limparRetrato(valor.retrato),
    classe: valor.classe,
    classeNome: classes[valor.classe],
    origem: valor.origem,
    origemNome: origens[valor.origem],
    historia: {
      passado: limparTexto(historia.passado, 3000),
      personalidade: limparTexto(historia.personalidade, 800),
      objetivo: limparTexto(historia.objetivo, 500),
      medo: limparTexto(historia.medo, 500),
      segredo: limparTexto(historia.segredo, 500)
    },
    atributos,
    pontosGastos: total,
    criadaEm: new Date().toISOString()
  };
}

app.post('/api/personagem/gerar-historia', async (req, res) => {
  try {
    const raca = limparTexto(req.body?.raca, 40);
    const classe = limparTexto(req.body?.classe, 40);
    const origem = limparTexto(req.body?.origem, 40);
    const nome = limparTexto(req.body?.nome, 40);
    const aparencia = limparTexto(req.body?.aparencia, 500);
    const objetivo = limparTexto(req.body?.objetivo, 500);
    if (!nome || !classe || !origem) return res.status(400).json({ erro: 'Preencha nome, classe e origem antes de gerar a história.' });
    const texto = await chamarNarradora({
      system: `CÂNONE DE AVARN:\n${textoCanonicoAvarn()}\n\nVocê é uma escritora de RPG de fantasia medieval. Escreva uma história de personagem em português brasileiro, coerente com raça, classe, origem e o cânone de Avarn. Não comece a aventura principal nem decida ações futuras. Crie um passado plausível, personalidade, motivação, medo e um segredo opcional. Não dê poderes ou equipamentos especiais sem justificativa. Responda apenas com JSON válido com as chaves passado, personalidade, objetivo, medo e segredo, todas strings.`,
      mensagens: [{ role: 'user', content: JSON.stringify({ nome, raca, classe, origem, aparencia, objetivo: objetivo || 'deixe surgir uma motivação interessante' }) }],
      maxTokens: 900,
      temperatura: 0.8,
      formato: { type: 'object', properties: { passado: { type: 'string' }, personalidade: { type: 'string' }, objetivo: { type: 'string' }, medo: { type: 'string' }, segredo: { type: 'string' } }, required: ['passado', 'personalidade', 'objetivo', 'medo', 'segredo'] }
    });
    const historia = lerJson(texto);
    if (!historia || typeof historia.passado !== 'string') throw new ErroNarradora('A IA não gerou uma história válida. Tente novamente.');
    res.json({ historia: Object.fromEntries(['passado','personalidade','objetivo','medo','segredo'].map(k => [k, limparTexto(historia[k], k === 'passado' ? 3000 : 800)])) });
  } catch (e) { responderErro(res, e); }
});

/* ---------- rotas ---------- */

app.post('/api/iniciar', async (req, res) => {
  try {
    const opcoes = limparOpcoes(req.body?.opcoes);
    const ficha = opcoes.genero === 'fantasia' ? limparFicha(req.body?.ficha) : null;
    if (opcoes.genero === 'fantasia' && !ficha) return res.status(400).json({ erro: 'Crie e confirme a ficha do personagem antes de iniciar uma nova aventura de fantasia.' });
    if (ficha) opcoes.nome = ficha.nome;
    const partida = { ficha, nomeAventura: limparTexto(req.body?.nomeAventura, 60) || `Aventura ${temaLegivel(opcoes.genero)}`, opcoes, mensagens: [], resumo: '', estado: { vida: 10, condicao: 'sem ferimentos relevantes', local: '', mochila: [] }, fim: false, ocupada: false, turnos: [], salvamentosManuais: [], criadaEm: new Date().toISOString() };
    const turno = await narrar(partida, TEXTO_ABERTURA);
    partida.turnos.push({ acao: null, turno });
    const id = registrar(partida);
    persistirPartidas();
    res.json({ ...paraCliente(turno, id), nomeAventura: partida.nomeAventura, tema: partida.opcoes.genero, ficha: partida.ficha || null });
  } catch (e) {
    responderErro(res, e);
  }
});

app.get('/api/continuar', (req, res) => {
  const partida = partidaAtualId ? partidas.get(partidaAtualId) : null;
  if (!partida || !partida.ultimoTurno) return res.json({ existe: false });
  res.json({ existe: true, partidaId: partidaAtualId, nomeAventura: partida.nomeAventura, tema: partida.opcoes?.genero, ficha: partida.ficha || null, turnos: partida.turnos || [], atual: paraCliente(partida.ultimoTurno, partidaAtualId) });
});

app.get('/api/aventuras', (_req, res) => {
  const aventuras = [...partidas.entries()]
    .filter(([, partida]) => partida.ultimoTurno)
    .map(([id, partida]) => resumoAventura(id, partida))
    .sort((a, b) => String(b.atualizadaEm).localeCompare(String(a.atualizadaEm)));
  res.json({ aventuras, partidaAtualId });
});

app.post('/api/aventuras/carregar', (req, res) => {
  const id = String(req.body?.partidaId || '');
  const partida = partidas.get(id);
  if (!partida?.ultimoTurno) return res.status(404).json({ erro: 'Essa aventura não foi encontrada.' });
  partidaAtualId = id;
  atualizarPartida(id, partida);
  res.json({ existe: true, partidaId: id, nomeAventura: partida.nomeAventura, tema: partida.opcoes.genero, ficha: partida.ficha || null, turnos: partida.turnos || [], atual: paraCliente(partida.ultimoTurno, id) });
});

app.get('/api/aventuras/:id/salvamentos', (req, res) => {
  const partida = partidas.get(req.params.id);
  if (!partida) return res.status(404).json({ erro: 'Aventura não encontrada.' });
  res.json({ salvamentos: (partida.salvamentosManuais || []).map(({ id, nome, criadoEm, turno }) => ({ id, nome, criadoEm, turno })) });
});

app.post('/api/aventuras/:id/salvamentos', (req, res) => {
  const partida = partidas.get(req.params.id);
  if (!partida?.ultimoTurno) return res.status(404).json({ erro: 'Aventura não encontrada.' });
  const nome = limparTexto(req.body?.nome, 60) || `Salvamento ${ (partida.salvamentosManuais || []).length + 1 }`;
  const salvamento = { id: randomUUID(), nome, criadoEm: new Date().toISOString(), turno: (partida.turnos || []).length, estado: snapshotPartida(partida) };
  partida.salvamentosManuais ||= [];
  partida.salvamentosManuais.push(salvamento);
  atualizarPartida(req.params.id, partida);
  res.json({ ok: true, salvamento: { id: salvamento.id, nome: salvamento.nome, criadoEm: salvamento.criadoEm, turno: salvamento.turno } });
});

app.post('/api/aventuras/:id/salvamentos/:saveId/carregar', (req, res) => {
  const partida = partidas.get(req.params.id);
  const salvo = partida?.salvamentosManuais?.find((s) => s.id === req.params.saveId);
  if (!partida || !salvo) return res.status(404).json({ erro: 'Esse salvamento não foi encontrado.' });
  const manuais = partida.salvamentosManuais;
  Object.assign(partida, JSON.parse(JSON.stringify(salvo.estado)));
  partida.salvamentosManuais = manuais;
  partida.ocupada = false;
  partidaAtualId = req.params.id;
  atualizarPartida(req.params.id, partida);
  res.json({ existe: true, partidaId: req.params.id, nomeAventura: partida.nomeAventura, tema: partida.opcoes.genero, ficha: partida.ficha || null, turnos: partida.turnos || [], atual: paraCliente(partida.ultimoTurno, req.params.id) });
});

app.delete('/api/aventuras/:id/salvamentos/:saveId', (req, res) => {
  const partida = partidas.get(req.params.id);
  if (!partida) return res.status(404).json({ erro: 'Aventura não encontrada.' });
  const antes = (partida.salvamentosManuais || []).length;
  partida.salvamentosManuais = (partida.salvamentosManuais || []).filter((s) => s.id !== req.params.saveId);
  if (antes === partida.salvamentosManuais.length) return res.status(404).json({ erro: 'Salvamento não encontrado.' });
  atualizarPartida(req.params.id, partida);
  res.json({ ok: true });
});

app.delete('/api/aventuras/:id', (req, res) => {
  if (!partidas.has(req.params.id)) return res.status(404).json({ erro: 'Aventura não encontrada.' });
  partidas.delete(req.params.id);
  if (partidaAtualId === req.params.id) partidaAtualId = null;
  persistirPartidas();
  res.json({ ok: true });
});

app.post('/api/jogada', async (req, res) => {
  const partidaId = req.body?.partidaId;
  const partida = partidas.get(partidaId);

  if (!partida) {
    return res.status(404).json({
      erro: 'Essa partida não existe mais (o servidor foi reiniciado?). Clique em Recomeçar.'
    });
  }
  if (partida.fim) {
    return res.status(400).json({ erro: 'A história já terminou. Clique em Recomeçar.' });
  }
  if (partida.ocupada) {
    return res.status(409).json({ erro: 'A narradora ainda está escrevendo. Espere um instante.' });
  }

  const tipoSolicitado = req.body?.tipo;
  const continuar = tipoSolicitado === 'continuar';
  const tipo = tipoSolicitado === 'fala' ? 'fala' : 'acao';
  const texto = limparTexto(req.body?.acao, 600);
  const destinatario = limparTexto(req.body?.destinatario, 120);
  if (!continuar && !texto) return res.status(400).json({ erro: tipo === 'fala' ? 'Escreva o que você quer dizer.' : 'Descreva o que você quer fazer.' });
  if (tipo === 'fala' && !destinatario) return res.status(400).json({ erro: 'Diga com quem você quer falar.' });
  const acao = continuar ? '' : (tipo === 'fala' ? `Você fala com ${destinatario}: “${texto}”` : texto);
  const entradaNarradora = continuar
    ? '<instrucao_interna>Continue a narrar a cena a partir do estado atual, fazendo o mundo avançar de forma natural. Não invente uma ação ou fala do personagem jogador. Esta instrução é interna e não deve aparecer como fala ou ação do jogador.</instrucao_interna>'
    : (tipo === 'fala'
      ? `<fala_do_jogador destinatario="${destinatario.replace(/[<>"&]/g, '')}">${texto}</fala_do_jogador>`
      : `<acao_do_jogador>${texto}</acao_do_jogador>`);

  partida.ocupada = true;
  try {
    const turno = await narrar(partida, entradaNarradora);
    if (!partida.turnos) partida.turnos = [];
    partida.turnos.push({ acao, turno });
    atualizarPartida(partidaId, partida);
    res.json(paraCliente(turno, partidaId));
  } catch (e) {
    responderErro(res, e);
  } finally {
    partida.ocupada = false;
    atualizarPartida(partidaId, partida);
  }
});

/* ---------- início ---------- */

// Avisa logo na partida se o Ollama não está pronto, em vez de só na primeira jogada
async function verificarOllama() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    const dados = await r.json();
    const nomes = (dados.models || []).map((m) => m.name);
    const instalado = nomes.some(
      (n) => n === MODELO || (!MODELO.includes(':') && n.split(':')[0] === MODELO)
    );
    if (!instalado) {
      console.warn(`Aviso: o modelo "${MODELO}" não está instalado. Rode: ollama pull ${MODELO}`);
    }
  } catch (e) {
    console.warn('Aviso: não encontrei o Ollama em ' + OLLAMA_URL + '. Abra o aplicativo do Ollama ou rode "ollama serve".');
  }
}

// Escuta só neste computador, para ninguém na sua rede usar a sua máquina
app.listen(PORTA, '127.0.0.1', () => {
  if (PROVEDOR_IA === 'gemini') {
    console.log(`Crônicas Sem Fim rodando em http://localhost:${PORTA} (Gemini: ${GEMINI_MODELO})`);
    if (!GEMINI_API_KEY) console.warn('Aviso: PROVEDOR_IA=gemini, mas GEMINI_API_KEY não foi definida no .env.');
  } else {
    console.log(`Crônicas Sem Fim rodando em http://localhost:${PORTA} (Ollama: ${MODELO})`);
    verificarOllama();
  }
});
