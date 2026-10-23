/*
 * CÂNONE EDITÁVEL DE AVARN
 * Edite este arquivo para atualizar tanto a página "Sistema > Fantasia"
 * quanto o contexto permanente enviado à IA narradora.
 * Evite registrar aqui acontecimentos que o jogador ainda não descobriu.
 */
export const AVARN = {
  id: 'fantasia',
  nome: 'Fantasia',
  resumo: 'Avarn é um mundo de fantasia medieval com povos diversos, magia limitada, deuses reais, poderes políticos e segredos antigos.',
  regrasNarrativas: [
    'Nenhum povo é inerentemente bom ou mau; raça não determina personalidade, inteligência, moralidade ou profissão.',
    'Culturas variam dentro de cada povo e região. Preconceitos e alianças dependem da história e das circunstâncias.',
    'A magia tem limites, custos e consequências. Não resolve qualquer problema sem esforço ou risco.',
    'As escolhas do jogador importam; falhas, ferimentos, perdas e morte são consequências possíveis.',
    'Não apresente como fato detalhes ainda não definidos neste cânone. Invente detalhes locais quando necessário, sem contradizer o que está escrito.',
    'A população em geral não sabe que os Divinos ainda existem. Não revele esse segredo sem uma descoberta narrativa justificável.'
  ],
  categorias: [
    { id:'mundo', titulo:'O mundo de Avarn', topicos:[
      {titulo:'Visão geral', texto:'Avarn é um mundo de fantasia medieval marcado por povos diversos, magia, deuses, conflitos políticos, criaturas extraordinárias e mistérios antigos. O tom permite política, preconceito, violência, mistério e personagens moralmente complexos.'},
      {titulo:'Princípios do mundo', texto:'Nenhuma raça é inerentemente boa ou má. Raça não determina personalidade, inteligência, moralidade ou profissão. Culturas variam, a magia tem limites e as escolhas dos personagens produzem consequências reais.'},
      {titulo:'Conhecimento do mundo', texto:'O conhecimento geográfico é desigual. Eldória é relativamente bem mapeada; Thalmyria e Kharadun são parcialmente conhecidas pelos habitantes de Eldória; Vaelthara é pouco conhecida por eles. Isso não significa que os habitantes locais desconheçam suas próprias terras.'}
    ]},
    { id:'povos', titulo:'Povos e raças', topicos:[
      {titulo:'Humanos', texto:'Vida semelhante à humana real, geralmente décadas e podendo aproximar-se de 100 anos. Há culturas de reinos e cidades organizadas, povos de fronteira e povos nômades. Religiões variam entre culturas; divindades semelhantes podem ter nomes e interpretações diferentes.'},
      {titulo:'Elfos', texto:'Podem viver até cerca de 750 anos. Tradições culturais incluem elfos das grandes florestas, elfos de cidades antigas e elfos errantes. Natureza, conhecimento, magia, arte e história podem ser importantes, sem definir todos os indivíduos.'},
      {titulo:'Anões', texto:'Podem viver até cerca de 500 anos. Há tradições de anões profundos, montanheses e de superfície. Suas comunidades podem valorizar mineração, forja, arquitetura, defesa, comércio e memória ancestral.'},
      {titulo:'Goblins', texto:'Podem viver até cerca de 150 anos. Existem tradições subterrâneas, urbanas e itinerantes. Comunidades podem se dedicar a comércio, artesanato, invenções, serviços, sobrevivência e circulação de conhecimentos.'},
      {titulo:'Orcs', texto:'Podem viver até cerca de 200 anos. Há tradições de orcs dos vales, das estepes e das terras altas. Culturas podem envolver agricultura, criação de animais, mobilidade, defesa, artesanato e organização comunitária. Orcs não são inerentemente violentos ou malignos.'},
      {titulo:'Pequeninos', texto:'Podem viver até cerca de 150 anos. Há tradições rurais, urbanas e viajantes. Comunidades podem se dedicar à agricultura, comércio, artesanato, navegação, hospitalidade e viagens.'},
      {titulo:'Convivência entre povos', texto:'Os seis povos — humanos, elfos, anões, goblins, orcs e pequeninos — existem em todos os quatro continentes, em proporções e culturas variadas. Nenhum continente pertence exclusivamente a um povo. Todos podem negociar, formar alianças, entrar em conflito ou conviver em comunidades multiculturais. Não há amizades ou inimizades universais entre raças.'}
    ]},
    { id:'deuses', titulo:'Deuses e religião', topicos:[
      {titulo:'O divino', texto:'Os deuses existem e podem influenciar o mundo, mas raramente se manifestam diretamente. A magia arcana é distinta dos dons divinos, que são raros. Existe uma vida após a morte, mas seus detalhes ainda não foram definidos.'},
      {titulo:'Deuses élficos', texto:'Aelthar, o Primeiro Artífice — criação, magia e conhecimento. Sylune, a Senhora do Véu — lua, sonhos e mistérios. Vaelora, a Raiz Eterna — natureza, memória e continuidade. Nyssara, a Tecelã das Sombras — ambição, segredos e domínio. Nem todo elfo cultua todos; seguidores de Nyssara não são automaticamente malignos.'},
      {titulo:'Deuses anões', texto:'Tharvorn, o Pai da Forja — criação, metalurgia e trabalho. Kharvessa, a Guardiã do Juramento — honra, proteção e coragem. Durnath, o Senhor das Profundezas — terra, minerais e segredos subterrâneos. Maergrin, a Memória da Pedra — ancestrais, história e legado.'},
      {titulo:'Deuses goblins', texto:'Zikhar, o Sorriso da Fortuna — sorte, astúcia e oportunidades. Grukkah, a Mãe das Engrenagens — invenções, engenhosidade e transformação. Varkuun, o Guardião dos Esquecidos — sobrevivência, exilados e proteção dos vulneráveis. Nymra, a Senhora do Crepúsculo — segredos, noite e liberdade.'},
      {titulo:'Deuses orcs', texto:'Vorgath, o Pai dos Primeiros — força, criação e perseverança. Uramma, a Mãe Selvagem — natureza, fertilidade e renovação. Drogmar, o Guardião dos Ancestrais — memória, tradição e pertencimento. Kravasha, a Senhora do Confronto — coragem, combate e sacrifício.'},
      {titulo:'Deuses pequeninos', texto:'Belmira, a Guardiã do Lar — família, acolhimento e comunidade. Tirimbo, o Senhor da Boa Sorte — sorte, ousadia e oportunidades. Ormélia, a Senhora da Colheita — abundância, alimento e renovação. Fenwick, o Andarilho das Estradas — viagem, liberdade e descoberta.'},
      {titulo:'Religiões humanas', texto:'As culturas humanas têm religiões e divindades regionais próprias. Divindades semelhantes podem ser conhecidas por nomes, histórias e interpretações diferentes. O panteão humano detalhado ainda não foi definido.'}
    ]},
    { id:'continentes', titulo:'Continentes e regiões', topicos:[
      {titulo:'Eldória', texto:'Continente central, com planícies férteis, rios, florestas, montanhas e litoral. É relativamente bem conhecido por seus habitantes e abriga os três grandes reinos humanos: Valdória, Dornávia e Merídia.'},
      {titulo:'Regiões de Eldória', texto:'Estrutura conceitual provisória: Planícies Centrais, Cordilheiras de Dornávia, Grandes Florestas, Vales Fluviais e Costa de Merídia. Os nomes das regiões naturais são provisórios.'},
      {titulo:'Thalmyria', texto:'A noroeste de Eldória e relativamente próxima. Predominam climas frios, invernos rigorosos, grandes cordilheiras e florestas ancestrais. É historicamente importante para elfos e anões. Regiões conceituais: Grandes Cordilheiras, Florestas Ancestrais, Vales Frios, Terras Setentrionais e Costa Fria.'},
      {titulo:'Kharadun', texto:'A sudeste de Eldória, com uma travessia marítima conhecida. Predominam regiões quentes e secas, desertos, estepes áridas, terras rochosas e redes de cavernas. Regiões conceituais: Grandes Desertos, Estepes Áridas, Terras Rochosas, Profundezas Subterrâneas e Costa Meridional.'},
      {titulo:'Vaelthara', texto:'A oeste de Eldória, além de um vasto oceano, e pouco conhecida pelos habitantes de Eldória. Possui florestas, planícies, montanhas, rios, lagos e diferentes zonas climáticas. Regiões conceituais: Florestas Extensas, Grandes Planícies, Cordilheiras Interiores, Terras das Águas e Costa Ocidental.'},
      {titulo:'Viagens marítimas', texto:'Existem rotas intercontinentais regulares, usadas por comerciantes, marinheiros e viajantes. Viagens longas custam caro e exigem navios, tripulações e suprimentos. Algumas travessias são perigosas e outras pouco exploradas; a distância de Vaelthara dificulta o contato frequente. Perigos marítimos específicos ainda não foram definidos.'}
    ]},
    { id:'politica', titulo:'Reinos e política', topicos:[
      {titulo:'Organização política', texto:'Cada continente possui várias potências políticas importantes, além de territórios menores e independentes. Nomes, fronteiras, governantes e sistemas políticos de outras potências ainda não foram definidos.'},
      {titulo:'Valdória', texto:'Grande reino de Eldória, conhecido por planícies férteis atravessadas por rios, grandes cidades, agricultura, comércio e uma monarquia consolidada.'},
      {titulo:'Dornávia', texto:'Grande reino de Eldória, marcado por montanhas, fortalezas e passagens estratégicas. Valoriza a defesa territorial e a autonomia; o terreno dificulta o acesso.'},
      {titulo:'Merídia', texto:'Grande reino costeiro de Eldória, com portos naturais, navegação, comércio marítimo e contato com povos estrangeiros.'},
      {titulo:'Relações entre os três reinos', texto:'Os três reinos compartilham fronteiras terrestres e mantêm uma paz instável. Valdória e Dornávia têm rivalidade política. Valdória e Merídia mantêm proximidade comercial, com divergências possíveis. Dornávia e Merídia mantêm relação pragmática, sem aliança forte nem inimizade declarada.'},
      {titulo:'Outros territórios', texto:'Eldória também contém cidades livres, comunidades autônomas e regiões fora do controle direto dos três reinos. Cada reino possui família real, mas nomes de casas, governantes e herdeiros ainda não foram definidos.'}
    ]},
    { id:'magia', titulo:'Magia', topicos:[
      {titulo:'Princípios', texto:'A magia arcana pode ser desenvolvida por estudo, prática, talento e conhecimento. Dons divinos são raros e distintos. Magia tem limites e pode exigir esforço, concentração, materiais, recursos ou preparação.'},
      {titulo:'Evocação', texto:'Fogo, gelo, relâmpagos e energia destrutiva.'},
      {titulo:'Restauração', texto:'Cura e estabilização. Ferimentos graves podem exigir tempo, recursos e conhecimento especializado.'},
      {titulo:'Ilusão e encantamento', texto:'Enganar sentidos, alterar percepções e influenciar mentes, sempre com limitações e possibilidade de resistência.'},
      {titulo:'Natureza e transformação', texto:'Manipulação de plantas, forças naturais e transformação de aspectos físicos.'},
      {titulo:'Ocultismo', texto:'Espíritos, maldições, rituais, vínculos sobrenaturais e conhecimentos proibidos.'},
      {titulo:'Aprendizado e limites', texto:'Qualquer pessoa pode tentar aprender magia arcana. Talento, estudo, treinamento e recursos afetam o progresso. É possível aprender várias escolas, com tempo e esforço. Magias poderosas exigem mais energia, concentração, materiais ou preparação; falhas podem causar exaustão, perda de controle ou danos colaterais. A ressurreição não é comum nem gratuita e a morte tem consequências reais.'},
      {titulo:'Magia na sociedade', texto:'A magia é usada em profissões, comércio, medicina, defesa e infraestrutura, conforme os recursos regionais. Existem academias, mentores, tradições familiares, ordens, grupos e estudo individual. Apesar da utilidade da magia, magos costumam enfrentar medo e desconfiança devido a abusos históricos. A maioria dos governos controla usos significativos por registro, autorização ou supervisão; as regras específicas podem variar.'}
    ]},
    { id:'criaturas', titulo:'Criaturas e perigos', topicos:[
      {titulo:'Grupos de criaturas', texto:'A fauna e os seres de Avarn incluem: animais comuns e extraordinários; monstros como dragões, wyverns, trolls e ogros; seres sobrenaturais como espíritos, mortos-vivos e entidades mágicas; e seres inteligentes não jogáveis capazes de negociar, formar alianças, viver em comunidades ou entrar em conflito.'},
      {titulo:'Frequência e perigo', texto:'Animais comuns são frequentes; animais extraordinários variam por ambiente. Alguns monstros são conhecidos em certas regiões, outros são raros. Criaturas lendárias e fenômenos sobrenaturais extraordinários são raros. O perigo é regional: a vida cotidiana costuma ser normal, mas estradas, florestas, montanhas, ruínas e regiões inexploradas podem ser perigosas.'},
      {titulo:'Comportamento', texto:'Nem todo monstro é maligno e nem toda criatura inteligente é amigável. Comportamento depende do indivíduo, cultura e circunstâncias. Criaturas clássicas de fantasia medieval são permitidas, sem copiar integralmente mundos ou regras de outras franquias.'}
    ]},
    { id:'historia', titulo:'História e mistérios', topicos:[
      {titulo:'As três eras', texto:'A história geral está dividida em Era Antiga, Era dos Conflitos e Era Atual. A cronologia detalhada, datas e muitos acontecimentos específicos ainda não foram definidos.'},
      {titulo:'Era Antiga', texto:'Os primeiros grandes povos eram os Divinos, considerados filhos dos deuses, colocados no mundo para procriar e criar o futuro. Por deformidades físicas, chifres e histórias difundidas, eram chamados também de “Demônios”, nome pejorativo. “Divinos” é sua denominação verdadeira/histórica. Em seu auge havia mais de dez milhões; ao fim da era começaram a ser caçados. A perseguição e quase extinção foram causas centrais do fim da era. Os responsáveis e as causas específicas ainda não foram definidos.'},
      {titulo:'Era dos Conflitos', texto:'Depois da Era Antiga, povos disputaram território, poder e conhecimento, enquanto novas civilizações e reinos surgiram entre ruínas do passado. Abusos históricos da magia contribuíram para a desconfiança dos magos; eventos específicos ainda não foram definidos.'},
      {titulo:'Era Atual', texto:'Avarn vive relativa estabilidade, com tensões que podem provocar grandes acontecimentos. Os três reinos de Eldória mantêm paz instável; os povos convivem, comercializam e entram em conflito conforme seus interesses. Ruínas, conhecimentos perdidos e regiões inexploradas permanecem.'},
      {titulo:'Os Divinos sobreviventes', texto:'Menos de cinco mil Divinos ainda vivem, mas a população atual não sabe disso. Sua sobrevivência é um segredo. Não invente uma explicação definitiva para como sobreviveram, onde vivem ou quem os persegue: esses detalhes ainda não foram definidos.'},
      {titulo:'Meio-Aberrações', texto:'Descendentes dos Divinos são conhecidos socialmente como “Meio-Aberrações”, termo pejorativo. São extremamente raros e sofrem preconceito por seu sangue divino, mesmo quando ocupam posições importantes. Ainda não foi definido se todos apresentam características físicas evidentes ou se alguns conseguem passar despercebidos.'}
    ]}
  ]
};

export function textoCanonicoAvarn() {
  return `CÂNONE DO UNIVERSO FANTASIA: AVARN\n${AVARN.resumo}\n\n` +
    AVARN.regrasNarrativas.map(x => `- ${x}`).join('\n') + '\n\n' +
    AVARN.categorias.map(c => `## ${c.titulo}\n` + c.topicos.map(t => `### ${t.titulo}\n${t.texto}`).join('\n\n')).join('\n\n');
}
