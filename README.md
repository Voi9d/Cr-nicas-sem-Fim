# Crônicas Sem Fim

RPG de texto em que uma IA narra a história e escreve as consequências de cada ação.

A narradora pode usar um modelo local pelo Ollama ou a API do Gemini, do Google. Com Ollama, o jogo pode funcionar sem internet; com Gemini, é necessária conexão e uma chave de API.


### Memória compartilhada e troca automática de narrador

A memória da aventura é controlada pelo próprio jogo, e não fica presa à memória interna do Gemini ou da Llama. O jogo salva o histórico recente, um resumo dos acontecimentos anteriores e o estado atual do personagem (vida, condição, local e mochila) em `partida-salva.json`. Essas informações são enviadas à IA escolhida em cada jogada.

Quando `PROVEDOR_IA=gemini`, o Gemini é o narrador principal. Se ele falhar por indisponibilidade, limite de uso, erro de conexão ou outro erro, o servidor tenta continuar com o Ollama usando o mesmo contexto e estado da aventura. Para isso funcionar, o Ollama precisa estar instalado, em execução, e o modelo definido em `MODELO` precisa estar baixado. Se os dois provedores falharem, o jogo informa o erro e preserva o estado anterior da jogada para que o jogador possa tentar novamente.

O arquivo `partida-salva.json` contém o progresso pessoal e é ignorado pelo Git. Não o apague se quiser manter suas aventuras locais.

## Como rodar

1. Instale o Node.js (versão 18 ou mais nova): https://nodejs.org
2. Escolha o provedor de IA:
   - Para usar Ollama, instale-o em https://ollama.com e baixe um modelo com `ollama pull llama3.1`.
   - Para usar Gemini, siga a seção **Como configurar a API do Gemini** abaixo para criar uma chave.
3. Nesta pasta, opcionalmente copie `.env.example` para `.env` e escolha o provedor.
4. Instale as dependências e inicie o servidor:

```bash
npm install
npm start
```

5. Abra http://localhost:3000 no navegador.

Depois da configuração inicial, normalmente basta executar `npm start`. Se estiver usando Ollama, ele precisa estar aberto; se estiver usando Gemini, o computador precisa de internet e a chave deve estar configurada.

Para encerrar o servidor, pressione `Ctrl + C` no terminal em que ele está rodando.

## Escolha do provedor de IA

O projeto aceita dois provedores, configurados pelo arquivo `.env`:

- **Ollama:** executa a IA no seu computador, sem cobrar por chamada e sem exigir internet depois de baixar o modelo. A velocidade depende do hardware.
- **Gemini API:** envia as solicitações para os servidores do Google; pode responder mais rápido em alguns computadores, mas depende da internet e está sujeito aos limites de uso do modelo e da conta.

### Como configurar a API do Gemini

1. Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey) com sua conta Google.
2. Crie uma chave de API (API key). Siga as instruções exibidas pelo Google.
3. Na pasta principal do projeto, copie `.env.example` e renomeie a cópia para `.env`.
4. Abra o arquivo `.env` com um editor de texto e configure estas linhas:

```env
PROVEDOR_IA=gemini
GEMINI_API_KEY=COLE_SUA_CHAVE_AQUI
GEMINI_MODELO=gemini-3.8-flash
```

5. Salve o arquivo e execute `npm start` no terminal, dentro da pasta do projeto.
6. Abra http://localhost:3000. Se o servidor já estava rodando, encerre com `Ctrl + C` e inicie novamente para carregar as novas configurações.

**Segurança:** nunca coloque a chave em arquivos JavaScript do navegador, no HTML ou em capturas públicas. A chave deve ficar somente no arquivo `.env`, que já está listado no `.gitignore`; não publique esse arquivo no GitHub nem compartilhe sua chave. Se ela vazar, revogue-a no Google AI Studio e crie outra.

A disponibilidade de uso gratuito, os limites de requisições e os modelos disponíveis podem mudar. Confira as informações atuais no [Google AI Studio](https://aistudio.google.com/) e na [documentação oficial da Gemini API](https://ai.google.dev/gemini-api/docs).

### Voltar para o Ollama

No arquivo `.env`, defina:

```env
PROVEDOR_IA=ollama
MODELO=llama3.1
OLLAMA_URL=http://127.0.0.1:11434
```

Salve e reinicie o servidor. Para usar outro modelo local, baixe-o com `ollama pull NOME_DO_MODELO` e altere `MODELO`.

### Variáveis disponíveis

- `PROVEDOR_IA`: `ollama` ou `gemini`.
- `MODELO`: nome do modelo instalado no Ollama.
- `OLLAMA_URL`: endereço do servidor Ollama, normalmente `http://127.0.0.1:11434`.
- `CONTEXTO`: contexto do modelo local em tokens.
- `GEMINI_API_KEY`: chave secreta da API Gemini.
- `GEMINI_MODELO`: modelo Gemini usado para gerar as respostas.
- `PORT`: porta do site, por padrão `3000`.

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

- `server.js`: servidor do jogo. Gerencia as aventuras, os salvamentos, a comunicação com o Ollama ou a API Gemini e o histórico das histórias.
- `narradora.js`: contém as instruções da narradora, os tamanhos das respostas e o formato de cada jogada. Edite esse arquivo para mudar o estilo da narração.
- `public/`: contém os arquivos do site, incluindo menu, opções, seleção de aventuras, salvamentos e interface do jogo.
- `partida-salva.json`: armazena os dados persistidos das aventuras e seus salvamentos.

## Observações

- As partidas **não são perdidas ao reiniciar o servidor**, pois ficam registradas no arquivo `partida-salva.json`.
- Se o arquivo for apagado, substituído ou danificado, os dados salvos poderão ser perdidos. Por isso, mantenha cópias de segurança.
- O servidor só aceita conexões deste computador por padrão. O jogo não fica automaticamente disponível para outros computadores ou pela internet.
- O provedor selecionado precisa estar disponível: Ollama instalado e em execução, ou Gemini configurado com chave válida e acesso à internet.

## Versão 0.1 — Funcionalidades

A versão 0.1 do **Crônicas Sem Fim** contém as seguintes funcionalidades:

- **RPG narrado por IA:** histórias narradas dinamicamente por um modelo de IA executado localmente pelo Ollama ou acessado pela API Gemini.
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
- **Execução local:** o jogo pode utilizar Ollama local sem chave de API ou a API Gemini com chave configurada no servidor.

## Versão 0.2 — Funcionalidades

A versão 0.1 do **Crônicas Sem Fim** contém as seguintes funcionalidades:

- Adaptado e colocado uma API do Gemini, para cada jogador poder escolher entre utilizar da Llama como ia principal, ou uma API do Gemini.
OBS: Você deve ter sua própria API para isso, e então colocar no .env (crie um na pasta, o .env.example apenas copie e cole no .env que você criar).

## Criação de personagem (fantasia)

Nas novas aventuras de fantasia, o jogador precisa confirmar uma ficha antes de começar. A ficha inclui identidade, classe, origem, história editável e seis atributos. Os atributos começam em 8, podem chegar a 15 e usam um orçamento de 27 pontos; valores acima de 13 custam pontos adicionais. É possível distribuir manualmente ou aplicar uma sugestão automática pela classe. A história pode ser escrita à mão ou gerada pela IA disponível, com fallback Gemini/Ollama. A ficha fica salva junto à aventura e é enviada no contexto narrativo aos dois provedores. Aventuras antigas continuam carregáveis sem ficha.


---

## Versão 0.5

### Universo Fantasia: Avarn

- O cânone editável do universo fica em `lore.js`.
- Esse arquivo alimenta a página `public/lore.html` (Menu → Sistema → Fantasia) e também é incluído no contexto da IA narradora nas aventuras de Fantasia.
- Para alterar povos, deuses, continentes, reinos, magia, criaturas ou eras, edite `AVARN.categorias` e `AVARN.regrasNarrativas` em `lore.js`. Evite apresentar segredos como conhecimento comum dos personagens; a IA recebe instruções para preservar essas informações.
- A criação de personagem inclui a escolha de raça, com descrição e longevidade aproximada. A raça escolhida é incluída na ficha e no contexto da narradora.
- O menu `Sistema` apresenta as opções Fantasia — Avarn e CyberPunk. CyberPunk permanece em desenvolvimento, ainda sem um cânone ou sistema de jogo implementado.

### Interação livre com a narradora

Ao final de cada narração, o jogador pode escolher entre **Ação**, **Falar Algo** e **Continuar**.

- **Ação:** permite descrever livremente o que o personagem tenta fazer.
- **Falar Algo:** permite informar o NPC com quem deseja conversar e escrever a própria fala. A narradora deve responder por meio de diálogos e pode descrever as reações do NPC.
- **Continuar:** solicita internamente que a narradora prossiga com a cena, sem exigir uma ação ou fala do personagem. A instrução interna não é exibida ao jogador como parte da história.

As antigas opções de ações sugeridas foram removidas para dar mais liberdade à interpretação e às decisões do jogador.

### Ficha do personagem e Diário

- A ficha do personagem pode ser consultada durante a aventura por meio do botão **Ficha**.
- O Diário permite registrar anotações pessoais e organizar informações em pastas.
- O registro automático da narradora pode ser ativado ou desativado pelo jogador.
- As informações automáticas devem ser organizadas por assunto, como personagens e NPCs, lugares, pistas e acontecimentos importantes, em vez de simplesmente copiar os parágrafos da narração.
- Quando uma informação é adicionada automaticamente, o jogo exibe uma notificação para informar o jogador.

### Objetivo desta versão

A versão 0.5 amplia a experiência de interpretação livre, a consulta à ficha do personagem e a organização de informações importantes da aventura. O objetivo é aproximar o jogo de uma experiência de RPG contínua, na qual as decisões do jogador, os acontecimentos narrados e as informações descobertas possam ser acompanhados durante a jornada.
