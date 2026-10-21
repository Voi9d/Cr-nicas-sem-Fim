/*
  Opções do jogador, salvas no navegador (localStorage).
  Usado pelo menu (index.html) e pelo jogo (jogo.html).
*/
const Opcoes = (() => {
  const CHAVE = 'cronicas-sem-fim:opcoes';

  const PADRAO = {
    nome: '',
    texto: 'medio',
    velocidade: 'normal',
    respostas: 'medias'
  };

  function aplicar(o) {
    document.documentElement.dataset.texto = o.texto;
  }

  function carregar() {
    try {
      const valores = Object.assign({}, PADRAO, JSON.parse(localStorage.getItem(CHAVE)));
      delete valores.genero; // compatibilidade com versões antigas: tema agora pertence a cada aventura
      return valores;
    } catch (e) {
      return Object.assign({}, PADRAO);
    }
  }

  function salvar(valores) {
    const novo = Object.assign(carregar(), valores);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch (e) {}
    aplicar(novo);
    return novo;
  }

  function restaurar() {
    try {
      localStorage.removeItem(CHAVE);
    } catch (e) {}
    aplicar(PADRAO);
    return Object.assign({}, PADRAO);
  }

  aplicar(carregar());

  return { carregar, salvar, restaurar, PADRAO };
})();
