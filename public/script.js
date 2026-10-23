
const historia = document.getElementById('historia');
const form = document.getElementById('form-acao');
const camposInteracao = document.getElementById('campos-acao');
const modoAcaoBtn = document.getElementById('modo-acao');
const modoFalaBtn = document.getElementById('modo-fala');
const enviarAcaoBtn = document.getElementById('enviar-acao');
let modoInteracao = 'acao';

const btnNovo = document.getElementById('novo-jogo');
const btnSalvar = document.getElementById('btn-salvar');
const btnSalvamentos = document.getElementById('btn-salvamentos');
const painelSalvamentos = document.getElementById('painel-salvamentos');
const listaSalvamentos = document.getElementById('lista-salvamentos');
const btnFicha = document.getElementById('btn-ficha');
const btnDiario = document.getElementById('btn-diario');
const painelFicha = document.getElementById('painel-ficha');
const painelDiario = document.getElementById('painel-diario');
const diarioAuto = document.getElementById('diario-auto');
const diarioPasta = document.getElementById('diario-pasta');
const diarioTitulo = document.getElementById('diario-titulo');
const diarioTexto = document.getElementById('diario-texto');
const diarioLista = document.getElementById('diario-lista');
let diarioNotas = [];
let diarioIdEditando = null;

const VELOCIDADES = {
  instantanea: 0,
  rapida: 8,
  normal: 18,
  lenta: 35
};

let partidaId = null;
let partidaIniciada = false;
let jogoEncerrado = false;
let ocupado = false;
let pular = false;

historia.addEventListener('click', () => {
  pular = true;
});

function reduzirMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function rolarFim(suave = true) {
  historia.scrollTo({
    top: historia.scrollHeight,
    behavior: suave && !reduzirMovimento() ? 'smooth' : 'auto'
  });
}

async function escrever(p, texto) {
  const atraso = reduzirMovimento() ? 0 : VELOCIDADES[Opcoes.carregar().velocidade];

  if (!atraso) {
    p.textContent = texto;
    return;
  }

  pular = false;

  for (let i = 1; i <= texto.length; i++) {
    if (pular) break;

    p.textContent = texto.slice(0, i);
    rolarFim(false);

    await new Promise((r) => setTimeout(r, atraso));
  }

  p.textContent = texto;
}

async function adicionar(classe, texto, digitar = false) {
  const p = document.createElement('p');
  p.className = classe;
  historia.appendChild(p);

  if (digitar) {
    await escrever(p, texto);
  } else {
    p.textContent = texto;
  }

  rolarFim();
  return p;
}

function atualizarStatus(estado) {
  if (!estado) return;

  document.getElementById('st-vida').textContent =
    estado.vida || '10 / 10';

  document.getElementById('st-local').textContent =
    estado.local || 'Ainda não definido';

  document.getElementById('st-mochila').textContent =
    estado.mochila || 'vazia';

  const condicao = document.getElementById('st-condicao');

  if (condicao) {
    condicao.textContent =
      estado.condicao || 'sem ferimentos relevantes';
  }
}

function travar(sim) {
  ocupado = sim;

  camposInteracao.querySelectorAll('input, textarea').forEach((el) => {
    el.disabled = sim || jogoEncerrado;
  });

  enviarAcaoBtn.disabled = sim || jogoEncerrado;
  modoAcaoBtn.disabled = sim || jogoEncerrado;
  modoFalaBtn.disabled = sim || jogoEncerrado;
  document.getElementById('modo-continuar').disabled = sim || jogoEncerrado;
  btnNovo.disabled = sim;
  btnSalvar.disabled = sim || !partidaId;
  btnSalvamentos.disabled = sim || !partidaId;
}

async function api(url, options = {}) {
  const resposta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      dados.erro || `Erro do servidor (${resposta.status}).`
    );
  }

  return dados;
}

async function requisitar(url, corpo) {
  return api(url, {
    method: 'POST',
    body: JSON.stringify(corpo)
  });
}

async function mostrarTurno(dados) {
  if (dados.ficha) window.fichaPersonagem = dados.ficha;
  atualizarStatus(dados.estado);
  registrarAutomaticamente(dados);

  for (const paragrafo of (dados.narracao || [])) {
    await adicionar(
      dados.fim ? 'narracao fim' : 'narracao',
      paragrafo,
      true
    );
  }

  jogoEncerrado = dados.fim === true;
  atualizarPergunta();

  if (jogoEncerrado) {
    await adicionar(
      'aguarde',
      'Esta trajetória chegou ao fim. Você pode continuar consultando os salvamentos ou iniciar outra aventura.'
    );
  }
}

function mostrarHistorico(turnos) {
  historia.replaceChildren();

  for (const registro of (turnos || [])) {
    if (registro.acao) {
      const p = document.createElement('p');
      p.className = 'jogador';
      p.textContent = registro.acao;
      historia.appendChild(p);
    }

    for (const paragrafo of (registro.turno?.narracao || [])) {
      const p = document.createElement('p');

      p.className = registro.turno?.fim
        ? 'narracao fim'
        : 'narracao';

      p.textContent = paragrafo;
      historia.appendChild(p);
    }
  }

  rolarFim(false);
}

async function carregarEstado(
  dados,
  mensagem = 'Aventura carregada.'
) {
  if (dados.ficha) window.fichaPersonagem = dados.ficha;
  else window.fichaPersonagem = null;
  partidaId = dados.partidaId;
  partidaIniciada = true;
  carregarDiario();

  document.getElementById('titulo-aventura').textContent =
    dados.nomeAventura || 'Crônicas Sem Fim';

  mostrarHistorico(dados.turnos || []);

  const atual = dados.atual;

  if (atual) {
    atualizarStatus(atual.estado);
    jogoEncerrado = atual.fim === true;
    atualizarPergunta();
  }

  await adicionar('aguarde', mensagem);
  travar(false);
}

async function novoJogo() {
  const params = new URLSearchParams(window.location.search);
  const genero = params.get('genero') || 'fantasia';
  const nomeAventura = params.get('nomeAventura') || '';
  const personagem = params.get('personagem') || '';

  travar(true);
  historia.replaceChildren();

  const aviso = await adicionar(
    'aguarde',
    'A narradora está preparando sua aventura…'
  );

  try {
    const opcoes = {
      ...Opcoes.carregar(),
      genero,
      nome: personagem || Opcoes.carregar().nome
    };

    let ficha = null;

    if (genero === 'fantasia') {
      try {
        const pendente = JSON.parse(
          sessionStorage.getItem('cronicas-ficha-pendente') || 'null'
        );

        ficha = pendente?.ficha || null;
      } catch {}

      if (!ficha) {
        throw new Error(
          'Esta aventura de fantasia precisa de uma ficha. Volte ao menu e crie seu personagem.'
        );
      }
    }

    const dados = await requisitar('/api/iniciar', {
      opcoes,
      nomeAventura,
      ficha
    });

    if (ficha) {
      sessionStorage.removeItem('cronicas-ficha-pendente');
    }

    aviso.remove();

    partidaId = dados.partidaId;
    partidaIniciada = true;
    carregarDiario();
    jogoEncerrado = false;

    window.history.replaceState(
      {},
      '',
      `jogo.html?partida=${encodeURIComponent(partidaId)}`
    );

    document.getElementById('titulo-aventura').textContent =
      dados.nomeAventura || 'Nova aventura';

    await mostrarTurno(dados);
  } catch (e) {
    aviso.className = 'aguarde erro';
    aviso.textContent =
      `${e.message} Verifique se o Ollama está aberto e tente novamente.`;
  } finally {
    travar(false);
  }
}

async function jogar(acao, detalhes = {}) {
  const tipoJogada = detalhes.tipo || 'acao';
  acao = String(acao || '').trim();

  if ((!acao && tipoJogada !== 'continuar') || !partidaId || jogoEncerrado || ocupado) {
    return;
  }

  travar(true);
  if (tipoJogada !== 'continuar') {
    await adicionar('jogador', acao);
  }

  const aviso = await adicionar(
    'aguarde',
    'A Mestra está analisando suas anotações...'
  );

  try {
    const dados = await requisitar('/api/jogada', {
      partidaId,
      acao,
      ...detalhes
    });

    aviso.remove();
    await mostrarTurno(dados);
  } catch (e) {
    aviso.className = 'aguarde erro';
    aviso.textContent =
      e.message ||
      'A narradora não respondeu. Verifique o servidor e tente de novo.';
  } finally {
    form.reset();
    travar(false);
    atualizarPergunta();

    if (!jogoEncerrado) {
      const campo = modoInteracao === 'fala'
        ? document.getElementById('destinatario-fala')
        : document.getElementById('campo-acao');

      campo?.focus();
    }
  }
}


function chaveDiario() { return `cronicas-diario-${partidaId || 'rascunho'}`; }
function carregarDiario() {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveDiario()) || '{}');
    diarioNotas = Array.isArray(dados.notas) ? dados.notas : [];
    diarioAuto.checked = dados.automatico !== false;
    const pastas = Array.isArray(dados.pastas) ? dados.pastas : [];
    for (const pasta of pastas) {
      if (![...diarioPasta.options].some(o => o.value === pasta)) {
        diarioPasta.add(new Option(pasta, pasta));
      }
    }
  } catch { diarioNotas = []; diarioAuto.checked = true; }
  renderDiario();
}
function salvarDiarioLocal() {
  const pastas = [...diarioPasta.options].map(o => o.value).filter(v => !['Geral','Personagens e NPCs','Missões e pistas','Lugares','Itens'].includes(v));
  localStorage.setItem(chaveDiario(), JSON.stringify({ notas: diarioNotas, automatico: diarioAuto.checked, pastas }));
}
function renderDiario() {
  diarioLista.replaceChildren();
  const pasta = diarioPasta.value;
  const notas = diarioNotas.filter(n => n.pasta === pasta);
  if (!notas.length) { const p=document.createElement('p'); p.textContent='Nenhuma anotação nesta pasta.'; diarioLista.append(p); return; }
  for (const nota of notas) {
    const item=document.createElement('div'); item.className='diario-nota';
    const texto=document.createElement('div'); const titulo=document.createElement('strong'); titulo.textContent=nota.titulo;
    const corpo=document.createElement('p'); corpo.textContent=nota.texto;
    texto.append(titulo,corpo);
    const botoes=document.createElement('div');
    const editar=document.createElement('button'); editar.className='btn-sec'; editar.type='button'; editar.textContent='Editar';
    editar.onclick=()=>{ diarioIdEditando=nota.id; diarioTitulo.value=nota.titulo; diarioTexto.value=nota.texto; diarioPasta.value=nota.pasta; };
    const excluir=document.createElement('button'); excluir.className='btn-sec'; excluir.type='button'; excluir.textContent='Excluir';
    excluir.onclick=()=>{ diarioNotas=diarioNotas.filter(n=>n.id!==nota.id); salvarDiarioLocal(); renderDiario(); };
    botoes.append(editar,excluir); item.append(texto,botoes); diarioLista.append(item);
  }
}
function notificarDiario(mensagem='Informação adicionada ao Diário') {
  const n=document.createElement('div'); n.className='notificacao-diario'; n.textContent=mensagem; n.setAttribute('role','status'); document.body.append(n);
  setTimeout(()=>n.remove(),3200);
}
function registrarAutomaticamente(turno) {
  if (!diarioAuto.checked || !turno || !Array.isArray(turno.diario)) return;
  let adicionadas = 0;
  for (const registro of turno.diario.slice(0, 4)) {
    if (!registro || !registro.titulo || !Array.isArray(registro.pontos)) continue;
    const titulo = String(registro.titulo).trim();
    const pontos = registro.pontos.map(p => String(p).trim()).filter(Boolean).slice(0, 6);
    if (!titulo || !pontos.length) continue;
    const pasta = ['Personagens e NPCs','Missões e pistas','Lugares','Itens','Geral'].includes(registro.pasta) ? registro.pasta : 'Geral';
    const chave = `${pasta}|${titulo}`.toLocaleLowerCase('pt-BR');
    const existente = diarioNotas.find(n => n.automatico && `${n.pasta}|${n.titulo}`.toLocaleLowerCase('pt-BR') === chave);
    if (existente) {
      // Acrescenta somente detalhes novos à nota existente, sem copiar a narração.
      for (const ponto of pontos) {
        if (!existente.texto.toLocaleLowerCase('pt-BR').includes(ponto.toLocaleLowerCase('pt-BR'))) {
          existente.texto += `\n• ${ponto}`;
          adicionadas++;
        }
      }
      continue;
    }
    diarioNotas.push({ id: crypto.randomUUID(), pasta, titulo, texto: pontos.map(p => `• ${p}`).join('\n'), automatico: true, criadoEm: Date.now() });
    adicionadas++;
  }
  if (adicionadas) { salvarDiarioLocal(); renderDiario(); notificarDiario('Informação organizada adicionada ao Diário'); }
}
document.getElementById('diario-salvar').addEventListener('click',()=>{
  const titulo=diarioTitulo.value.trim(), texto=diarioTexto.value.trim();
  if(!titulo || !texto){ alert('Preencha o título e a anotação.'); return; }
  if(diarioIdEditando){ const n=diarioNotas.find(n=>n.id===diarioIdEditando); if(n) Object.assign(n,{titulo,texto,pasta:diarioPasta.value,automatico:false}); }
  else diarioNotas.push({id:crypto.randomUUID(),titulo,texto,pasta:diarioPasta.value,automatico:false,criadoEm:Date.now()});
  diarioIdEditando=null; diarioTitulo.value=''; diarioTexto.value=''; salvarDiarioLocal(); renderDiario();
});
document.getElementById('diario-nova').addEventListener('click',()=>{diarioIdEditando=null;diarioTitulo.value='';diarioTexto.value='';});
document.getElementById('diario-nova-pasta').addEventListener('click',()=>{
  const nome=prompt('Nome da nova pasta:'); if(!nome?.trim()) return;
  if([...diarioPasta.options].some(o=>o.value.toLowerCase()===nome.trim().toLowerCase())) { diarioPasta.value=nome.trim(); return; }
  diarioPasta.add(new Option(nome.trim(),nome.trim())); diarioPasta.value=nome.trim(); salvarDiarioLocal(); renderDiario();
});
diarioPasta.addEventListener('change',renderDiario);
diarioAuto.addEventListener('change',salvarDiarioLocal);
function exibirFicha(dados) {
  if (dados && typeof dados === 'object') window.fichaPersonagem = dados;
  const conteudo = document.getElementById('conteudo-ficha');
  conteudo.replaceChildren();
  const fichaPendente = JSON.parse(sessionStorage.getItem('cronicas-ficha-pendente') || 'null');
  const ficha = window.fichaPersonagem || fichaPendente?.ficha || null;
  if (!ficha) {
    conteudo.textContent = 'Esta aventura não tem uma ficha salva. Aventuras antigas criadas antes da ficha pode não ter esses dados; crie uma nova aventura com uma ficha para salvá-la.';
    return;
  }
  const sec = (titulo, campos) => {
    const h = document.createElement('h3'); h.textContent = titulo; conteudo.appendChild(h);
    const dl = document.createElement('dl');
    for (const [rotulo, valor] of campos) {
      if (valor === undefined || valor === null || valor === '') continue;
      const dt = document.createElement('dt'); dt.textContent = rotulo;
      const dd = document.createElement('dd');
      dd.textContent = typeof valor === 'object' ? Object.entries(valor).map(([k,v]) => `${k}: ${v}`).join(' · ') : String(valor);
      dl.append(dt, dd);
    }
    conteudo.appendChild(dl);
  };
  sec('Identidade', [['Nome',ficha.nome],['Idade',ficha.idade],['Gênero',ficha.genero],['Raça',ficha.racaNome || ficha.raca],['Classe',ficha.classeNome || ficha.classe],['Origem',ficha.origemNome || ficha.origem],['Aparência',ficha.aparencia],['Retrato',ficha.retrato?.valor]]);
  sec('Atributos', Object.entries(ficha.atributos || {}).map(([k,v]) => [k[0].toUpperCase()+k.slice(1),v]));
  sec('História pessoal', [['Passado',ficha.historia?.passado],['Personalidade',ficha.historia?.personalidade],['Objetivo',ficha.historia?.objetivo],['Medo',ficha.historia?.medo],['Segredo',ficha.historia?.segredo]]);
}
btnFicha.addEventListener('click',()=>{
  painelFicha.hidden=!painelFicha.hidden; painelDiario.hidden=true;
  if(!painelFicha.hidden) exibirFicha(window.fichaPersonagem);
});
btnDiario.addEventListener('click',()=>{painelDiario.hidden=!painelDiario.hidden; painelFicha.hidden=true; carregarDiario();});
document.getElementById('fechar-ficha').addEventListener('click',()=>painelFicha.hidden=true);
document.getElementById('fechar-diario').addEventListener('click',()=>painelDiario.hidden=true);
document.getElementById('modo-continuar').addEventListener('click',()=>jogar('',{tipo:'continuar'}));

async function iniciarTela() {
  const params = new URLSearchParams(window.location.search);

  try {
    if (params.get('nova') === '1') {
      await novoJogo();
      return;
    }

    const id = params.get('partida');

    if (id) {
      const dados = await requisitar(
        '/api/aventuras/carregar',
        { partidaId: id }
      );

      await carregarEstado(dados, 'Aventura carregada.');
      return;
    }

    const dados = await api('/api/continuar');

    if (!dados.existe) {
      window.location.replace('index.html');
      return;
    }

    const aventuras = await api('/api/aventuras');

    const atual = aventuras.aventuras.find(
      (a) => a.id === dados.partidaId
    );

    await carregarEstado(
      {
        ...dados,
        nomeAventura: atual?.nome || 'Aventura salva'
      },
      'Aventura recuperada automaticamente.'
    );
  } catch (e) {
    await adicionar(
      'aguarde erro',
      `${e.message} Volte ao menu e tente selecionar a aventura novamente.`
    );

    travar(false);
  }
}

async function salvarPonto() {
  if (!partidaId || ocupado) return;

  const nome = window.prompt(
    'Nome para este ponto de salvamento:',
    `Ponto ${new Date().toLocaleString('pt-BR')}`
  );

  if (nome === null) return;

  try {
    const dados = await requisitar(
      `/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos`,
      { nome }
    );

    await listarSalvamentos();
    painelSalvamentos.hidden = false;

    alert(`Salvamento “${dados.salvamento.nome}” criado.`);
  } catch (e) {
    alert(e.message);
  }
}

async function listarSalvamentos() {
  if (!partidaId) return;

  try {
    const dados = await api(
      `/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos`
    );

    listaSalvamentos.replaceChildren();

    if (!dados.salvamentos.length) {
      const vazio = document.createElement('p');
      vazio.className = 'dica-salvamento';
      vazio.textContent =
        'Ainda não há pontos manuais nesta aventura.';

      listaSalvamentos.appendChild(vazio);
      return;
    }

    for (const save of dados.salvamentos) {
      const item = document.createElement('div');
      item.className = 'salvamento-item';

      const info = document.createElement('div');

      const nome = document.createElement('strong');
      nome.textContent = save.nome;

      const meta = document.createElement('small');
      meta.textContent =
        `Turno ${save.turno} · ${new Date(save.criadoEm).toLocaleString('pt-BR')}`;

      info.append(nome, meta);

      const actions = document.createElement('div');
      actions.className = 'salvamento-acoes';

      const carregar = document.createElement('button');
      carregar.className = 'btn-sec';
      carregar.type = 'button';
      carregar.textContent = 'Carregar';

      carregar.addEventListener('click', async () => {
        if (!confirm(
          `Carregar “${save.nome}”? O progresso automático desta aventura voltará a este ponto, mas os outros salvamentos manuais serão mantidos.`
        )) {
          return;
        }

        try {
          const dadosCarregados = await requisitar(
            `/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos/${encodeURIComponent(save.id)}/carregar`,
            {}
          );

          painelSalvamentos.hidden = true;

          await carregarEstado(
            dadosCarregados,
            `Salvamento “${save.nome}” carregado.`
          );

          await listarSalvamentos();
        } catch (e) {
          alert(e.message);
        }
      });

      const excluir = document.createElement('button');
      excluir.className = 'btn-sec';
      excluir.type = 'button';
      excluir.textContent = 'Excluir';

      excluir.addEventListener('click', async () => {
        if (!confirm(`Excluir o salvamento “${save.nome}”?`)) {
          return;
        }

        try {
          await api(
            `/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos/${encodeURIComponent(save.id)}`,
            { method: 'DELETE' }
          );

          await listarSalvamentos();
        } catch (e) {
          alert(e.message);
        }
      });

      actions.append(carregar, excluir);
      item.append(info, actions);
      listaSalvamentos.appendChild(item);
    }
  } catch (e) {
    listaSalvamentos.textContent = e.message;
  }
}

function atualizarPergunta() {
  const frases = [
    'O que você faz?',
    'Qual é o seu próximo passo?',
    'Como você reage?',
    'O que você decide fazer agora?',
    'Como você quer prosseguir?'
  ];

  document.getElementById('pergunta-acao').textContent =
    frases[Math.floor(Math.random() * frases.length)];

  modoAcaoBtn.classList.toggle(
    'ativo',
    modoInteracao === 'acao'
  );

  modoFalaBtn.classList.toggle(
    'ativo',
    modoInteracao === 'fala'
  );

  modoAcaoBtn.setAttribute(
    'aria-pressed',
    String(modoInteracao === 'acao')
  );

  modoFalaBtn.setAttribute(
    'aria-pressed',
    String(modoInteracao === 'fala')
  );

  enviarAcaoBtn.textContent =
    modoInteracao === 'acao' ? 'Enviar ação' : 'Enviar fala';

  if (modoInteracao === 'acao') {
    camposInteracao.innerHTML =
      '<input id="campo-acao" type="text" placeholder="Descreva o que você faz…" aria-label="Descreva sua ação" maxlength="600" required>';
  } else {
    camposInteracao.innerHTML =
      '<input id="destinatario-fala" type="text" placeholder="Com quem você quer falar?" aria-label="Com quem você quer falar" maxlength="120" required><textarea id="texto-fala" placeholder="O que você diz? Escreva sua fala…" aria-label="O que você vai dizer" maxlength="600" rows="3" required></textarea>';
  }

  if (ocupado || jogoEncerrado) {
    camposInteracao.querySelectorAll('input, textarea').forEach((el) => {
      el.disabled = true;
    });
  }
}

modoAcaoBtn.addEventListener('click', () => {
  modoInteracao = 'acao';
  atualizarPergunta();
  document.getElementById('campo-acao').focus();
});

modoFalaBtn.addEventListener('click', () => {
  modoInteracao = 'fala';
  atualizarPergunta();
  document.getElementById('destinatario-fala').focus();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (modoInteracao === 'acao') {
    const texto =
      document.getElementById('campo-acao')?.value || '';

    jogar(texto, { tipo: 'acao' });
  } else {
    const destinatario =
      document.getElementById('destinatario-fala')?.value || '';

    const fala =
      document.getElementById('texto-fala')?.value || '';

    if (!destinatario.trim() || !fala.trim()) return;

    jogar(fala, { tipo: 'fala', destinatario });
  }
});

btnNovo.addEventListener('click', () => {
  window.location.href = 'index.html';
});

btnSalvar.addEventListener('click', salvarPonto);

btnSalvamentos.addEventListener('click', async () => {
  painelSalvamentos.hidden = !painelSalvamentos.hidden;

  if (!painelSalvamentos.hidden) {
    await listarSalvamentos();
  }
});

document.getElementById('fechar-salvamentos').addEventListener(
  'click',
  () => {
    painelSalvamentos.hidden = true;
  }
);

iniciarTela();
