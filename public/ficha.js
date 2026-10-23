const form = document.getElementById('form-ficha');
const attrsEl = document.getElementById('atributos');
const restantesEl = document.getElementById('pontos-restantes');
const erroEl = document.getElementById('erro-ficha');
const gerarBtn = document.getElementById('gerar-historia');
const statusIa = document.getElementById('status-ia');
const attrNames = { forca: 'Força', destreza: 'Destreza', constituicao: 'Constituição', inteligencia: 'Inteligência', sabedoria: 'Sabedoria', carisma: 'Carisma' };
const presets = {
  guerreiro: {forca:15,destreza:12,constituicao:15,inteligencia:8,sabedoria:10,carisma:8},
  ladino: {forca:8,destreza:15,constituicao:12,inteligencia:12,sabedoria:10,carisma:11},
  mago: {forca:8,destreza:12,constituicao:12,inteligencia:15,sabedoria:12,carisma:9},
  patrulheiro: {forca:12,destreza:15,constituicao:12,inteligencia:9,sabedoria:14,carisma:8},
  paladino: {forca:15,destreza:8,constituicao:14,inteligencia:8,sabedoria:10,carisma:15}
};
const racasInfo = {
  humanos:{titulo:'Humanos',vida:'Geralmente vivem várias décadas, podendo aproximar-se de 100 anos.',resumo:'Um povo diverso, organizado em reinos, cidades, comunidades fronteiriças e grupos nômades. Suas culturas e religiões variam bastante.'},
  elfos:{titulo:'Elfos',vida:'Podem viver até cerca de 750 anos.',resumo:'Existem tradições ligadas às grandes florestas, às cidades antigas e à vida errante. Natureza, conhecimento, magia, arte e história têm diferentes importâncias entre suas culturas.'},
  anoes:{titulo:'Anões',vida:'Podem viver até cerca de 500 anos.',resumo:'Há comunidades subterrâneas, montanhosas e de superfície. Muitas preservam tradições de forja, mineração, arquitetura, defesa e memória ancestral.'},
  goblins:{titulo:'Goblins',vida:'Podem viver até cerca de 150 anos.',resumo:'Existem comunidades subterrâneas, urbanas e itinerantes. Comércio, artesanato, invenções e sobrevivência fazem parte de diferentes tradições goblins.'},
  orcs:{titulo:'Orcs',vida:'Podem viver até cerca de 200 anos.',resumo:'Há tradições dos vales, das estepes e das terras altas, com comunidades agrícolas, povos móveis e assentamentos montanhosos. Orcs não são inerentemente violentos ou malignos.'},
  pequeninos:{titulo:'Pequeninos',vida:'Podem viver até cerca de 150 anos.',resumo:'Existem comunidades rurais, urbanas e viajantes, ligadas de diferentes formas à agricultura, ao comércio, à navegação, à hospitalidade e às estradas.'}
};
const classesInfo = {
  guerreiro: {titulo:'Guerreiro',resumo:'Especialista em combate direto, armas e proteção dos aliados.',talento:'Disciplina de batalha',detalhe:'Tem facilidade narrativa para reconhecer armas, avaliar ameaças e manter a posição sob pressão.',estilo:'Ideal para quem quer enfrentar o perigo de frente.'},
  ladino: {titulo:'Ladino',resumo:'Ágil, discreto e astuto; prefere vencer com precisão, estratégia ou surpresa.',talento:'Passos silenciosos',detalhe:'Tem aptidão para infiltração, armadilhas, fechaduras e perceber oportunidades escondidas.',estilo:'Ideal para quem prefere esperteza e furtividade.'},
  mago: {titulo:'Mago',resumo:'Estudioso dos mistérios arcanos, runas, símbolos e forças sobrenaturais.',talento:'Estudo arcano',detalhe:'Reconhece pistas mágicas, símbolos antigos e fenômenos que outros podem não compreender.',estilo:'Ideal para quem busca conhecimento e poder mágico.'},
  patrulheiro: {titulo:'Patrulheiro',resumo:'Explorador atento, habilidoso em rastrear, sobreviver e lutar à distância.',talento:'Olho da trilha',detalhe:'Tem aptidão para seguir rastros, encontrar caminhos e perceber sinais do ambiente.',estilo:'Ideal para quem gosta de exploração e vida selvagem.'},
  paladino: {titulo:'Paladino',resumo:'Combatente guiado por um juramento, com foco em proteção, coragem e convicção.',talento:'Voto inabalável',detalhe:'Sua determinação pode inspirar aliados e ajudá-lo a resistir à intimidação em momentos decisivos.',estilo:'Ideal para quem quer defender uma causa ou proteger os outros.'}
};
const origensInfo = {
  nobre:{titulo:'Nobre',resumo:'Cresceu perto de poder, tradições e disputas de influência.',talento:'Etiqueta e linhagem',detalhe:'Conhece costumes da corte, brasões e formas de abordar figuras importantes.',gancho:'Talvez carregue um título, uma dívida familiar ou um rival.'},
  orfao:{titulo:'Órfão',resumo:'Aprendeu cedo a se virar sem uma família que o protegesse.',talento:'Instinto de sobrevivência',detalhe:'Sabe procurar abrigo, avaliar intenções e encontrar recursos em lugares difíceis.',gancho:'O passado pode esconder pistas sobre sua família ou sobre quem o criou.'},
  mercenario:{titulo:'Mercenário',resumo:'Já vendeu suas habilidades para sobreviver, escoltando pessoas ou lutando por contrato.',talento:'Leitura de ameaças',detalhe:'Tem experiência em avaliar riscos, negociar pagamento e reconhecer sinais de emboscada.',gancho:'Um antigo contrato pode voltar para cobrar seu preço.'},
  aprendiz:{titulo:'Aprendiz',resumo:'Foi treinado por um mestre, numa oficina, biblioteca, templo ou escola de combate.',talento:'Conhecimento de ofício',detalhe:'Tem familiaridade com rotinas de treinamento e pode reconhecer ferramentas e métodos da área em que aprendeu.',gancho:'Seu mestre pode ser uma referência, uma cobrança ou um mistério.'},
  ex_criminoso:{titulo:'Ex-criminoso',resumo:'Conhece o submundo e tenta deixar para trás escolhas ou companhias perigosas.',talento:'Contatos do submundo',detalhe:'Sabe como se comunicar com informantes, reconhecer códigos e perceber golpes comuns.',gancho:'Alguém pode ainda lembrar de seus antigos feitos.'},
  viajante:{titulo:'Viajante',resumo:'Passou anos cruzando estradas, povoados e regiões desconhecidas.',talento:'Costumes e caminhos',detalhe:'Tem noções de rotas, hábitos locais e como se adaptar a ambientes diferentes.',gancho:'Uma viagem antiga pode explicar por que você está nessa região.'}
};
const retratos = ['🧙','🧝','🧝‍♀️','🧔','🧑‍🎤','🛡️','🏹','🗡️','🧛','🧚','🐺','🐉'];
let attrs = {forca:8,destreza:8,constituicao:8,inteligencia:8,sabedoria:8,carisma:8};
let retrato = {tipo:'emoji',valor:'🧙'};
const custo = n => n <= 13 ? n - 8 : 5 + (n - 13) * 2;
function gastos() { return Object.values(attrs).reduce((s,n)=>s+custo(n),0); }
function desenharAtributos() {
  attrsEl.replaceChildren();
  for (const [key,label] of Object.entries(attrNames)) {
    const card = document.createElement('div'); card.className='atributo';
    const l=document.createElement('label'); l.textContent=label;
    const controls=document.createElement('div'); controls.className='atributo-controle';
    const menos=document.createElement('button'); menos.type='button'; menos.textContent='−'; menos.setAttribute('aria-label',`Diminuir ${label}`);
    const valor=document.createElement('span'); valor.className='atributo-valor'; valor.textContent=attrs[key];
    const mais=document.createElement('button'); mais.type='button'; mais.textContent='+'; mais.setAttribute('aria-label',`Aumentar ${label}`);
    menos.disabled=attrs[key]<=8; mais.disabled=attrs[key]>=15 || gastos()+custo(attrs[key]+1)-custo(attrs[key])>27;
    menos.addEventListener('click',()=>{attrs[key]--;desenharAtributos()});
    mais.addEventListener('click',()=>{if(attrs[key]<15 && gastos()+custo(attrs[key]+1)-custo(attrs[key])<=27){attrs[key]++;desenharAtributos()}});
    controls.append(menos,valor,mais);card.append(l,controls);attrsEl.append(card);
  }
  restantesEl.textContent=`Pontos restantes: ${27-gastos()}`;
}
function aplicarPreset() { attrs={...presets[form.elements.classe.value]}; desenharAtributos(); }
function resetarAtributos() { attrs={forca:8,destreza:8,constituicao:8,inteligencia:8,sabedoria:8,carisma:8}; desenharAtributos(); }
document.getElementById('distribuir-auto').addEventListener('click',()=>{aplicarPreset();document.getElementById('modo-atributos').value='automatico';});
document.getElementById('resetar-atributos').addEventListener('click',()=>{resetarAtributos();document.getElementById('modo-atributos').value='manual';});
form.elements.raca.addEventListener('change',mostrarRaca);
form.elements.classe.addEventListener('change',()=>{mostrarDescricao();});
form.elements.origem.addEventListener('change',mostrarDescricao);
function preencherDescricao(el, data, subtitulo) {
  el.replaceChildren();
  const h=document.createElement('h3');h.textContent=data.titulo;
  const resumo=document.createElement('p');resumo.textContent=data.resumo;
  const habilidade=document.createElement('p');habilidade.innerHTML=`<strong>${subtitulo}:</strong> ${data.talento}`;
  const detalhe=document.createElement('p');detalhe.textContent=data.detalhe;
  const extra=document.createElement('p');extra.textContent=data.estilo||data.gancho;
  el.append(h,resumo,habilidade,detalhe,extra);
}
function mostrarRaca(){
  const data=racasInfo[form.elements.raca.value]; const el=document.getElementById('descricao-raca'); el.replaceChildren();
  const h=document.createElement('h3');h.textContent=data.titulo;
  const p=document.createElement('p');p.textContent=data.resumo;
  const vida=document.createElement('p');vida.textContent='Longevidade aproximada: '+data.vida;
  const nota=document.createElement('p');nota.textContent='A raça não determina personalidade, inteligência, moralidade ou profissão.';
  el.append(h,p,vida,nota);
}
function mostrarDescricao(){preencherDescricao(document.getElementById('descricao-classe'),classesInfo[form.elements.classe.value],'Talento característico');preencherDescricao(document.getElementById('descricao-origem'),origensInfo[form.elements.origem.value],'Vantagem de origem');}
function desenharRetratos(){const el=document.getElementById('retrato-presets');el.replaceChildren();for(const emoji of retratos){const b=document.createElement('button');b.type='button';b.className='retrato-preset';b.textContent=emoji;b.setAttribute('aria-label',`Usar retrato ${emoji}`);b.setAttribute('aria-pressed',retrato.tipo==='emoji'&&retrato.valor===emoji?'true':'false');b.addEventListener('click',()=>{retrato={tipo:'emoji',valor:emoji};mostrarRetrato();});el.append(b);}}
function mostrarRetrato(){const preview=document.getElementById('retrato-preview');preview.replaceChildren();if(retrato.tipo==='imagem'){const img=document.createElement('img');img.src=retrato.valor;img.alt='Retrato escolhido';preview.append(img);}else preview.textContent=retrato.valor;desenharRetratos();}
document.getElementById('retrato-arquivo').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){erroEl.textContent='Escolhe um arquivo de imagem válido.';erroEl.hidden=false;return;}try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=data;});const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');const scale=Math.max(256/img.width,256/img.height);const w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(256-w)/2,(256-h)/2,w,h);retrato={tipo:'imagem',valor:canvas.toDataURL('image/jpeg',0.78)};mostrarRetrato();erroEl.hidden=true;}catch{erroEl.textContent='Não consegui abrir essa imagem. Tenta outro arquivo.';erroEl.hidden=false;}finally{e.target.value='';}});
document.getElementById('remover-retrato').addEventListener('click',()=>{retrato={tipo:'emoji',valor:'🧙'};mostrarRetrato();});
async function api(url, options={}) { const r=await fetch(url,{headers:{'Content-Type':'application/json'},...options});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.erro||`Erro ${r.status}`);return d; }
gerarBtn.addEventListener('click',async()=>{
  erroEl.hidden=true;statusIa.textContent='Gerando uma sugestão de história…';gerarBtn.disabled=true;
  try {
    const dados=await api('/api/personagem/gerar-historia',{method:'POST',body:JSON.stringify({nome:form.elements.nome.value.trim(),raca:form.elements.raca.value,racaLore:racasInfo[form.elements.raca.value].resumo,classe:form.elements.classe.value,origem:form.elements.origem.value,aparencia:form.elements.aparencia.value,objetivo:form.elements.objetivo.value})});
    for(const key of ['passado','personalidade','objetivo','medo','segredo']) if(dados.historia[key]) form.elements[key].value=dados.historia[key];
    statusIa.textContent='História gerada. Revise e edite antes de confirmar.';
  } catch(e){statusIa.textContent='';erroEl.textContent=e.message;erroEl.hidden=false;} finally{gerarBtn.disabled=false;}
});
form.addEventListener('submit',e=>{
  e.preventDefault();erroEl.hidden=true;
  if(gastos()>27){erroEl.textContent='Ultrapassaste os pontos disponíveis.';erroEl.hidden=false;return;}
  const values=Object.fromEntries(new FormData(form).entries());
  const ficha={nome:values.nome.trim(),raca:values.raca,racaNome:racasInfo[values.raca].titulo,racaLore:racasInfo[values.raca].resumo,idade:values.idade,genero:values.genero,aparencia:values.aparencia,retrato,classe:values.classe,origem:values.origem,historia:{passado:values.passado,personalidade:values.personalidade,objetivo:values.objetivo,medo:values.medo,segredo:values.segredo},atributos:attrs};
  const params=new URLSearchParams(window.location.search); const payload={ficha,genero:'fantasia',nomeAventura:params.get('nomeAventura')||''};
  sessionStorage.setItem('cronicas-ficha-pendente',JSON.stringify(payload));
  window.location.href=`jogo.html?nova=1&genero=fantasia&nomeAventura=${encodeURIComponent(payload.nomeAventura)}&personagem=${encodeURIComponent(ficha.nome)}&ficha=1`;
});
desenharAtributos();mostrarRaca();mostrarDescricao();desenharRetratos();
