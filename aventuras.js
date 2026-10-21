const lista = document.getElementById('lista-aventuras');
const statusLista = document.getElementById('status-lista');
const fmt = (valor) => valor ? new Date(valor).toLocaleString('pt-BR') : 'Data desconhecida';

async function api(url, options = {}) {
  const resposta = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível concluir a operação.');
  return dados;
}

function botao(texto, classe, acao) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = classe; b.textContent = texto; b.addEventListener('click', acao); return b;
}

async function carregarLista() {
  try {
    const dados = await api('/api/aventuras');
    lista.replaceChildren();
    if (!dados.aventuras.length) {
      statusLista.textContent = '';
      const vazio = document.createElement('p'); vazio.className = 'vazio'; vazio.textContent = 'Ainda não há aventuras salvas. Volte ao menu e clique em Iniciar para criar a primeira história.'; lista.appendChild(vazio); return;
    }
    statusLista.textContent = `${dados.aventuras.length} aventura(s) encontrada(s).`;
    for (const a of dados.aventuras) {
      const card = document.createElement('article'); card.className = 'aventura-card';
      const h = document.createElement('h2'); h.textContent = a.nome;
      const tema = document.createElement('p'); tema.className = 'aventura-meta'; tema.textContent = `${a.temaLegivel} · Personagem: ${a.personagem}`;
      const local = document.createElement('p'); local.className = 'aventura-meta'; local.textContent = `Local: ${a.local} · Vida: ${a.vida}/10 · Turnos: ${a.quantidadeTurnos}`;
      const data = document.createElement('p'); data.className = 'aventura-meta'; data.textContent = `Última atividade: ${fmt(a.atualizadaEm)} · Salvamentos manuais: ${a.quantidadeSalvamentos}${a.fim ? ' · História encerrada' : ''}`;
      const actions = document.createElement('div'); actions.className = 'aventura-acoes';
      const continuar = document.createElement('a'); continuar.className = 'btn'; continuar.href = `jogo.html?partida=${encodeURIComponent(a.id)}`; continuar.textContent = 'Continuar aventura';
      actions.append(continuar, botao('Excluir aventura', 'btn-perigo', async () => {
        if (!confirm(`Excluir “${a.nome}” e todos os seus salvamentos? Esta ação não pode ser desfeita.`)) return;
        try { await api(`/api/aventuras/${encodeURIComponent(a.id)}`, { method: 'DELETE' }); await carregarLista(); }
        catch (e) { alert(e.message); }
      }));
      card.append(h, tema, local, data, actions); lista.appendChild(card);
    }
  } catch (e) { statusLista.textContent = e.message; }
}
carregarLista();
