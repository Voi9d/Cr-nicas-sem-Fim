const historia = document.getElementById('historia');
const opcoesEl = document.getElementById('opcoes');
const form = document.getElementById('form-acao');
const campo = document.getElementById('campo-acao');
const btnNovo = document.getElementById('novo-jogo');
const btnSalvar = document.getElementById('btn-salvar');
const btnSalvamentos = document.getElementById('btn-salvamentos');
const painelSalvamentos = document.getElementById('painel-salvamentos');
const listaSalvamentos = document.getElementById('lista-salvamentos');
const VELOCIDADES = { instantanea: 0, rapida: 8, normal: 18, lenta: 35 };

let ultimasOpcoes = [];
let partidaId = null;
let partidaIniciada = false;
let jogoEncerrado = false;
let ocupado = false;
let pular = false;

historia.addEventListener('click', () => { pular = true; });

function reduzirMovimento() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function rolarFim(suave = true) {
  historia.scrollTo({ top: historia.scrollHeight, behavior: suave && !reduzirMovimento() ? 'smooth' : 'auto' });
}
async function escrever(p, texto) {
  const atraso = reduzirMovimento() ? 0 : VELOCIDADES[Opcoes.carregar().velocidade];
  if (!atraso) { p.textContent = texto; return; }
  pular = false;
  for (let i = 1; i <= texto.length; i++) {
    if (pular) break;
    p.textContent = texto.slice(0, i); rolarFim(false);
    await new Promise((r) => setTimeout(r, atraso));
  }
  p.textContent = texto;
}
async function adicionar(classe, texto, digitar = false) {
  const p = document.createElement('p'); p.className = classe; historia.appendChild(p);
  if (digitar) await escrever(p, texto); else p.textContent = texto;
  rolarFim(); return p;
}
function mostrarOpcoes(lista) {
  ultimasOpcoes = Array.isArray(lista) ? lista : [];
  opcoesEl.replaceChildren();
  ultimasOpcoes.forEach((texto) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opcao'; b.textContent = texto;
    b.disabled = jogoEncerrado || ocupado; b.addEventListener('click', () => jogar(texto)); opcoesEl.appendChild(b);
  });
}
function atualizarStatus(estado) {
  if (!estado) return;
  document.getElementById('st-vida').textContent = estado.vida || '10 / 10';
  document.getElementById('st-local').textContent = estado.local || 'Ainda não definido';
  document.getElementById('st-mochila').textContent = estado.mochila || 'vazia';
  const condicao = document.getElementById('st-condicao');
  if (condicao) condicao.textContent = estado.condicao || 'sem ferimentos relevantes';
}
function travar(sim) {
  ocupado = sim;
  campo.disabled = sim || jogoEncerrado;
  form.querySelector('button').disabled = sim || jogoEncerrado;
  btnNovo.disabled = sim;
  btnSalvar.disabled = sim || !partidaId;
  btnSalvamentos.disabled = sim || !partidaId;
  opcoesEl.querySelectorAll('button').forEach((b) => { b.disabled = sim || jogoEncerrado; });
}
async function api(url, options = {}) {
  const resposta = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || `Erro do servidor (${resposta.status}).`);
  return dados;
}
async function requisitar(url, corpo) { return api(url, { method: 'POST', body: JSON.stringify(corpo) }); }
async function mostrarTurno(dados) {
  atualizarStatus(dados.estado);
  for (const paragrafo of (dados.narracao || [])) await adicionar(dados.fim ? 'narracao fim' : 'narracao', paragrafo, true);
  jogoEncerrado = dados.fim === true;
  mostrarOpcoes(jogoEncerrado ? [] : dados.opcoes);
  if (jogoEncerrado) await adicionar('aguarde', 'Esta trajetória chegou ao fim. Você pode continuar consultando os salvamentos ou iniciar outra aventura.');
}
function mostrarHistorico(turnos) {
  historia.replaceChildren();
  for (const registro of (turnos || [])) {
    if (registro.acao) { const p = document.createElement('p'); p.className = 'jogador'; p.textContent = registro.acao; historia.appendChild(p); }
    for (const paragrafo of (registro.turno?.narracao || [])) {
      const p = document.createElement('p'); p.className = registro.turno?.fim ? 'narracao fim' : 'narracao'; p.textContent = paragrafo; historia.appendChild(p);
    }
  }
  rolarFim(false);
}
async function carregarEstado(dados, mensagem = 'Aventura carregada.') {
  partidaId = dados.partidaId; partidaIniciada = true;
  document.getElementById('titulo-aventura').textContent = dados.nomeAventura || 'Crônicas Sem Fim';
  mostrarHistorico(dados.turnos || []);
  const atual = dados.atual;
  if (atual) {
    atualizarStatus(atual.estado); jogoEncerrado = atual.fim === true;
    mostrarOpcoes(jogoEncerrado ? [] : atual.opcoes);
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
  const aviso = await adicionar('aguarde', 'A narradora está preparando sua aventura…');
  try {
    const opcoes = { ...Opcoes.carregar(), genero, nome: personagem || Opcoes.carregar().nome };
    const dados = await requisitar('/api/iniciar', { opcoes, nomeAventura });
    aviso.remove(); partidaId = dados.partidaId; partidaIniciada = true; jogoEncerrado = false;
    window.history.replaceState({}, '', `jogo.html?partida=${encodeURIComponent(partidaId)}`);
    document.getElementById('titulo-aventura').textContent = dados.nomeAventura || 'Nova aventura';
    await mostrarTurno(dados);
  } catch (e) {
    aviso.className = 'aguarde erro'; aviso.textContent = `${e.message} Verifique se o Ollama está aberto e tente novamente.`;
  } finally { travar(false); }
}
async function jogar(acao) {
  acao = String(acao || '').trim();
  if (!acao || !partidaId || jogoEncerrado || ocupado) return;
  travar(true);
  await adicionar('jogador', acao); opcoesEl.replaceChildren();
  const aviso = await adicionar('aguarde', 'A história continua…');
  try {
    const dados = await requisitar('/api/jogada', { partidaId, acao });
    aviso.remove(); await mostrarTurno(dados);
  } catch (e) {
    aviso.className = 'aguarde erro'; aviso.textContent = e.message || 'A narradora não respondeu. Verifique o servidor e tente de novo.';
    mostrarOpcoes(ultimasOpcoes);
  } finally { campo.value = ''; travar(false); if (!jogoEncerrado) campo.focus(); }
}
async function iniciarTela() {
  const params = new URLSearchParams(window.location.search);
  try {
    if (params.get('nova') === '1') { await novoJogo(); return; }
    const id = params.get('partida');
    if (id) {
      const dados = await requisitar('/api/aventuras/carregar', { partidaId: id });
      await carregarEstado(dados, 'Aventura carregada. Tu pode continuar de onde parou.'); return;
    }
    const dados = await api('/api/continuar');
    if (!dados.existe) { window.location.replace('index.html'); return; }
    const aventuras = await api('/api/aventuras');
    const atual = aventuras.aventuras.find((a) => a.id === dados.partidaId);
    await carregarEstado({ ...dados, nomeAventura: atual?.nome || 'Aventura salva' }, 'Aventura recuperada automaticamente.');
  } catch (e) {
    await adicionar('aguarde erro', `${e.message} Volte ao menu e tente selecionar a aventura novamente.`);
    travar(false);
  }
}
async function salvarPonto() {
  if (!partidaId || ocupado) return;
  const nome = window.prompt('Nome para este ponto de salvamento:', `Ponto ${new Date().toLocaleString('pt-BR')}`);
  if (nome === null) return;
  try {
    const dados = await requisitar(`/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos`, { nome });
    await listarSalvamentos();
    painelSalvamentos.hidden = false;
    alert(`Salvamento “${dados.salvamento.nome}” criado.`);
  } catch (e) { alert(e.message); }
}
async function listarSalvamentos() {
  if (!partidaId) return;
  try {
    const dados = await api(`/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos`);
    listaSalvamentos.replaceChildren();
    if (!dados.salvamentos.length) {
      const vazio = document.createElement('p'); vazio.className = 'dica-salvamento'; vazio.textContent = 'Ainda não há pontos manuais nesta aventura.'; listaSalvamentos.appendChild(vazio); return;
    }
    for (const save of dados.salvamentos) {
      const item = document.createElement('div'); item.className = 'salvamento-item';
      const info = document.createElement('div');
      const nome = document.createElement('strong'); nome.textContent = save.nome;
      const meta = document.createElement('small'); meta.textContent = `Turno ${save.turno} · ${new Date(save.criadoEm).toLocaleString('pt-BR')}`;
      info.append(nome, meta);
      const actions = document.createElement('div'); actions.className = 'salvamento-acoes';
      const carregar = document.createElement('button'); carregar.className = 'btn-sec'; carregar.type = 'button'; carregar.textContent = 'Carregar';
      carregar.addEventListener('click', async () => {
        if (!confirm(`Carregar “${save.nome}”? O progresso automático desta aventura voltará a este ponto, mas os outros salvamentos manuais serão mantidos.`)) return;
        try {
          const dadosCarregados = await requisitar(`/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos/${encodeURIComponent(save.id)}/carregar`, {});
          painelSalvamentos.hidden = true; await carregarEstado(dadosCarregados, `Salvamento “${save.nome}” carregado.`); await listarSalvamentos();
        } catch (e) { alert(e.message); }
      });
      const excluir = document.createElement('button'); excluir.className = 'btn-sec'; excluir.type = 'button'; excluir.textContent = 'Excluir';
      excluir.addEventListener('click', async () => {
        if (!confirm(`Excluir o salvamento “${save.nome}”?`)) return;
        try { await api(`/api/aventuras/${encodeURIComponent(partidaId)}/salvamentos/${encodeURIComponent(save.id)}`, { method: 'DELETE' }); await listarSalvamentos(); }
        catch (e) { alert(e.message); }
      });
      actions.append(carregar, excluir); item.append(info, actions); listaSalvamentos.appendChild(item);
    }
  } catch (e) { listaSalvamentos.textContent = e.message; }
}
form.addEventListener('submit', (e) => { e.preventDefault(); jogar(campo.value); });
btnNovo.addEventListener('click', () => { window.location.href = 'index.html'; });
btnSalvar.addEventListener('click', salvarPonto);
btnSalvamentos.addEventListener('click', async () => { painelSalvamentos.hidden = !painelSalvamentos.hidden; if (!painelSalvamentos.hidden) await listarSalvamentos(); });
document.getElementById('fechar-salvamentos').addEventListener('click', () => { painelSalvamentos.hidden = true; });
iniciarTela();
