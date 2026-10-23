const telas = {
  menu: document.getElementById('tela-menu'),
  nova: document.getElementById('tela-nova'),
  opcoes: document.getElementById('tela-opcoes'),
  creditos: document.getElementById('tela-creditos'),
  sistema: document.getElementById('tela-sistema')
};

const focoPadrao = {
  menu: 'btn-iniciar',
  nova: 'nova-nome',
  opcoes: 'op-nome',
  creditos: 'voltar-creditos',
  sistema: 'voltar-sistema'
};

function mostrar(nome, focoId) {
  Object.keys(telas).forEach((k) => {
    telas[k].hidden = k !== nome;
  });
  const alvo = document.getElementById(focoId || focoPadrao[nome]);
  if (alvo) alvo.focus();
}

// Navegação entre telas
document.getElementById('btn-iniciar').addEventListener('click', () => mostrar('nova'));
document.getElementById('btn-sistema').addEventListener('click', () => mostrar('sistema'));
document.getElementById('voltar-sistema').addEventListener('click', () => mostrar('menu', 'btn-sistema'));
document.getElementById('btn-cyberpunk').addEventListener('click', () => { document.getElementById('sistema-aviso').textContent = 'O sistema CyberPunk está em fase de desenvolvimento.'; });
document.getElementById('btn-opcoes').addEventListener('click', () => mostrar('opcoes'));
document.getElementById('voltar-nova').addEventListener('click', () => mostrar('menu', 'btn-iniciar'));
document.getElementById('criar-aventura').addEventListener('click', () => {
  const formNova = document.getElementById('form-nova');
  const genero = formNova.elements.genero.value;
  const nomeAventura = formNova.elements.nomeAventura.value.trim();
  const personagem = formNova.elements.personagem.value.trim();
  if (genero === 'fantasia') {
    const params = new URLSearchParams({ nomeAventura });
    window.location.href = `ficha.html?${params.toString()}`;
    return;
  }
  const params = new URLSearchParams({ nova: '1', genero, nomeAventura, personagem });
  window.location.href = `jogo.html?${params.toString()}`;
});
document.getElementById('btn-creditos').addEventListener('click', () => mostrar('creditos'));
document.getElementById('voltar-opcoes').addEventListener('click', () => mostrar('menu', 'btn-opcoes'));
document.getElementById('voltar-creditos').addEventListener('click', () => mostrar('menu', 'btn-creditos'));

// Esc volta ao menu a partir de Opções ou Créditos
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!telas.nova.hidden) mostrar('menu', 'btn-iniciar');
  else if (!telas.opcoes.hidden) mostrar('menu', 'btn-opcoes');
  else if (!telas.creditos.hidden) mostrar('menu', 'btn-creditos');
  else if (!telas.sistema.hidden) mostrar('menu', 'btn-sistema');
});

// Setas para cima e para baixo percorrem os itens do menu
document.getElementById('lista-menu').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const itens = Array.from(document.querySelectorAll('#lista-menu .item'));
  const i = itens.indexOf(document.activeElement);
  const prox = e.key === 'ArrowDown'
    ? (i + 1) % itens.length
    : (i - 1 + itens.length) % itens.length;
  itens[prox].focus();
});

// Opções: preencher o formulário e salvar a cada mudança
const form = document.getElementById('form-opcoes');
const CAMPOS_ESCOLHA = ['respostas', 'velocidade', 'texto'];

function preencher(o) {
  form.elements.nome.value = o.nome;
  CAMPOS_ESCOLHA.forEach((k) => {
    const radio = form.querySelector('input[name="' + k + '"][value="' + o[k] + '"]');
    if (radio) radio.checked = true;
  });
}

function lerFormulario() {
  const valores = { nome: form.elements.nome.value.trim() };
  CAMPOS_ESCOLHA.forEach((k) => {
    valores[k] = form.elements[k].value;
  });
  return valores;
}

form.addEventListener('input', () => Opcoes.salvar(lerFormulario()));
form.addEventListener('submit', (e) => e.preventDefault());

document.getElementById('restaurar').addEventListener('click', () => {
  preencher(Opcoes.restaurar());
});

preencher(Opcoes.carregar());

// A animação de entrada roda só uma vez, ao abrir a página
setTimeout(() => document.body.classList.remove('entrando'), 3000);
