# Crônicas Sem Fim

RPG de texto em que uma IA narra a história e escreve as consequências de cada ação.

A narradora é um modelo Llama que roda no seu próprio computador, com o Ollama. Não precisa de internet para jogar nem de chave de API.

## Como rodar

1. Instale o Node.js (versão 18 ou mais nova): https://nodejs.org
2. Instale o Ollama: https://ollama.com e deixe o aplicativo aberto.
3. Baixe o modelo (uma vez só). No terminal, execute:

```bash
ollama pull llama3.1
```

4. Nesta pasta, instale as dependências e inicie o servidor:

```bash
npm install
npm start
```

5. Abra http://localhost:3000 no navegador.

Depois da instalação inicial, normalmente basta deixar o Ollama aberto e executar `npm start` para jogar novamente.

Para encerrar o servidor, pressione `Ctrl + C` no terminal em que ele está rodando.

## Qual modelo usar

- `llama3.1` (8B, cerca de 4,7 GB): o padrão. Recomenda-se um computador com aproximadamente 8 GB de RAM livres ou uma placa de vídeo.
- `llama3.2` (3B, cerca de 2 GB): para computadores mais fracos. É mais rápido, mas pode apresentar narrações piores e erros no formato das respostas.

Para trocar o modelo, copie o arquivo `.env.example` para `.env` e defina:

```env
MODELO=llama3.2
```

A primeira jogada demora mais, porque o modelo precisa carregar na memória. Sem placa de vídeo, cada resposta pode levar de alguns segundos a mais de um minuto, dependendo do computador.

## Como jogar

- **Iniciar:** cria uma nova aventura. Antes de começar, você escolhe o tema da história e pode definir um nome para a aventura e para o personagem.
- **Selecionar Aventura:** abre a lista de aventuras salvas, permitindo escolher uma história para continuar ou excluir uma aventura.
- **Continuar jogando:** escreva suas ações e aguarde a narradora descrever os acontecimentos e suas consequências.
- **Nova aventura:** permite voltar ao menu para iniciar outra história. O progresso da aventura anterior é mantido automaticamente.

Cada aventura possui seu próprio tema e progresso, permitindo jogar diferentes histórias sem precisar apagar as anteriores.

## Aventuras e salvamentos

O jogo possui salvamento automático e salvamentos manuais.

### Salvamento automático

- O progresso é atualizado após cada jogada concluída.
- As aventuras são armazenadas no arquivo `partida-salva.json`, na pasta do projeto.
- Ao encerrar o servidor e executar `npm start` novamente, os dados salvos são carregados, permitindo continuar as aventuras.
- Cada aventura mantém seu próprio progresso, incluindo o histórico e o estado atual da história.

### Salvamentos manuais

- Dentro do jogo, clique em **Salvar ponto** para criar um salvamento manual.
- Você pode dar um nome para cada ponto e criar vários salvamentos na mesma aventura.
- A opção **Salvamentos** permite consultar os pontos existentes, carregar um deles ou excluí-lo.
- Ao carregar um ponto manual, o progresso automático daquela aventura volta ao estado registrado nesse ponto. Os demais salvamentos manuais são mantidos.

### Cuidados com os arquivos

- **Não apague o arquivo `partida-salva.json`** se quiser preservar suas aventuras e seus salvamentos.
- Faça uma cópia de segurança desse arquivo antes de reinstalar, atualizar ou mover o projeto para outra pasta.
- Se você substituir o arquivo por uma versão antiga, poderá perder o progresso mais recente.
- Os salvamentos ficam no computador em que o servidor está sendo executado. Eles não são enviados automaticamente para a nuvem.

## Estrutura do projeto

- `server.js`: servidor do jogo. Gerencia as aventuras, os salvamentos, a comunicação com o Ollama e o histórico das histórias.
- `narradora.js`: contém as instruções da narradora, os tamanhos das respostas e o formato de cada jogada. Edite esse arquivo para mudar o estilo da narração.
- `public/`: contém os arquivos do site, incluindo menu, opções, seleção de aventuras, salvamentos e interface do jogo.
- `partida-salva.json`: armazena os dados persistidos das aventuras e seus salvamentos.

## Observações

- As partidas **não são perdidas ao reiniciar o servidor**, pois ficam registradas no arquivo `partida-salva.json`.
- Se o arquivo for apagado, substituído ou danificado, os dados salvos poderão ser perdidos. Por isso, mantenha cópias de segurança.
- O servidor só aceita conexões deste computador por padrão. O jogo não fica automaticamente disponível para outros computadores ou pela internet.
- O Ollama precisa estar instalado e em execução para que a IA consiga narrar as histórias.

## Versão 0.1 — Funcionalidades

A versão 0.1 do **Crônicas Sem Fim** contém as seguintes funcionalidades:

- **RPG narrado por IA:** histórias narradas dinamicamente por um modelo Llama executado localmente através do Ollama.
- **Aventuras com temas diferentes:** possibilidade de iniciar histórias com diferentes temas, como fantasia ou ficção científica.
- **Aventuras independentes:** cada história possui seu próprio progresso, permitindo alternar entre diferentes aventuras.
- **Criação de personagem:** possibilidade de definir o nome do personagem ao iniciar uma aventura.
- **Escolhas livres:** o jogador descreve suas ações por meio de texto, e a IA narra as consequências.
- **Consequências das ações:** as decisões do jogador influenciam o desenvolvimento da história e podem resultar em sucessos, falhas, danos e outras consequências.
- **Sistema de vida e ferimentos:** o personagem pode sofrer danos e ficar ferido durante a aventura.
- **Morte do personagem:** situações fatais podem encerrar a aventura, impedindo que o personagem continue agindo naquele estado.
- **Salvamento automático:** o progresso é registrado após cada jogada concluída.
- **Salvamentos manuais:** possibilidade de criar vários pontos de salvamento com nomes personalizados e carregar ou excluir esses pontos.
- **Persistência dos dados:** as aventuras e seus salvamentos permanecem registrados no arquivo `partida-salva.json` após o encerramento do servidor.
- **Personalização da experiência:** opções para ajustar o tamanho das respostas da narradora, a velocidade da narração e o tamanho do texto.
- **Execução local:** o jogo utiliza o Ollama para executar a IA no próprio computador, sem exigir uma chave de API.

### Status do projeto

A versão 0.1 representa a primeira etapa do projeto, com o sistema básico de RPG, a narração por inteligência artificial e o gerenciamento de aventuras e salvamentos implementados. O projeto poderá receber melhorias, correções e novas funcionalidades em versões futuras.

## Funcionalidades planejadas para versões futuras

O **Crônicas Sem Fim** está em desenvolvimento, e algumas das ideias para as próximas versões incluem:

- **Sistema de fichas de personagem:** permitir que o jogador crie uma ficha antes de iniciar uma aventura, definindo atributos, habilidades, características e outras informações relevantes para o personagem.
- **Sistema de atributos e habilidades:** utilizar os valores da ficha para influenciar as ações, os testes e as possibilidades do personagem durante a história.
- **Rolagem de dados:** implementar dados virtuais, como o clássico D20, para determinar o resultado de ações, testes de habilidade, combates e situações de risco.
- **Sistema de testes e dificuldades:** combinar os atributos do personagem, as rolagens de dados e a dificuldade de cada situação para determinar o sucesso ou o fracasso de uma ação.
- **Combate mais desenvolvido:** aprimorar as mecânicas de combate, considerando atributos, equipamentos, ferimentos e resultados das rolagens.
- **Inventário e equipamentos:** expandir o gerenciamento de itens, armas, armaduras e outros recursos que possam influenciar a aventura.
- **Maior integração entre as mecânicas e a IA:** fazer com que a narradora considere melhor as fichas, os atributos, as rolagens e as regras do jogo ao descrever as consequências das ações.

Essas funcionalidades representam ideias para o desenvolvimento futuro do projeto e poderão ser modificadas, ampliadas ou reorganizadas conforme a evolução do jogo.
