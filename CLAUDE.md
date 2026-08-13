# CLAUDE.md — Contexto permanente do projeto

Este arquivo é lido automaticamente pelo Claude Code no início de toda sessão
neste repositório. Ele existe para que as regras abaixo não precisem ser
repetidas em cada novo pedido.

## Sobre este projeto

Site de apoio do curso **"Introdução à Programação com Python: Lógica, Jogos
e Acessibilidade"** — curso online, 15 aulas semanais de 2h, para jovens a
partir de 16 anos, com turma de nível misto (iniciantes absolutos e alunos
com alguma base). Há um aluno cego na turma, usuário do Narrador do Windows,
sem experiência prévia de programação.

**Acessibilidade não é um extra: é critério de aceite em toda página, todo
componente e todo exercício interativo.**

Site estático, publicado no GitHub Pages.

## Pilha técnica (fixa — não trocar sem combinar antes)

- HTML5 semântico + CSS puro + JavaScript vanilla. Sem React, Vue, jQuery,
  bundlers ou etapa de build.
- Pyodide (via CDN) para o editor Python embutido — carregado sob demanda
  (lazy load), nunca bloqueando o carregamento inicial da página.
- Sem cookies, sem analytics de terceiros, sem propaganda, sem serviços
  externos de formulário. Contato/dúvida usa link `mailto:`.

## Convenção de nomenclatura

Segue a mesma regra usada no conteúdo Python do curso, estendida ao código do
próprio site:

- Tudo em português, sem acentos, trocando "ç" por "c"
  (ex.: `licao`, `acessibilidade`, `duvida`, `exercicio`).
- Pastas e arquivos: `kebab-case`
  (ex.: `aulas/aula-02-primeiro-programa/index.html`, `estilo-principal.css`).
  Única exceção: `index.html` (exigido pelo GitHub Pages) e `CLAUDE.md`/
  `README.md` (convenções do próprio GitHub).
- Classes CSS: `kebab-case` (ex.: `.grade-de-aulas`, `.botao-executar`).
- Variáveis e funções JavaScript: `camelCase`, mas com nomes em português
  (ex.: `executarCodigo`, `areaDeSaida`, `carregarPyodide`).
- Nunca usar inglês em nome de variável, função ou classe, mesmo quando for
  mais comum no mercado — é regra pedagógica do curso e vale para o site.

## Identidade visual

- Fundo: preto (`#000000` ou bem próximo, ex. `#0a0a0a`).
- Texto: branco (`#ffffff`) — alto contraste.
- Cor de destaque (links, botões, foco): um único tom quente, ex. `#ffc857`.
  Usar com moderação; nunca como única forma de indicar significado (sempre
  reforçar com texto ou ícone também).
- Cor secundária opcional para etiquetas de status ("Em breve" etc.): tom
  frio, ex. `#5dd9c1`.
- Toda combinação de cor precisa passar WCAG AA: contraste mínimo 4.5:1 para
  texto normal, 3:1 para texto grande/ícones.
- Tipografia: **Atkinson Hyperlegible** (Google Fonts) em todo o texto —
  fonte livre, desenhada para legibilidade por pessoas com baixa visão.
  Fallback: `system-ui, sans-serif`. **Proibido usar fonte pixelada/8-bit**
  em qualquer lugar do site, mesmo em títulos.
- Tamanho de fonte base: mínimo 1rem (16px); usar `rem`, não `px` fixo, para
  não quebrar o zoom do navegador.
- Grade de cards inspirada em página de itch.io: cada aula é um cartão com
  número, título, resumo curto e etiqueta de status (Disponível / Em breve).

## Checklist de acessibilidade (aplicar em toda página nova)

- `<html lang="pt-br">`; marcação semântica (`<header>`, `<nav>`, `<main>`,
  `<footer>`); um único `<h1>` por página; hierarquia de headings sem pular
  nível.
- Link "Pular para o conteúdo" como primeiro elemento focável de cada página.
- Foco de teclado sempre visível (nunca `outline: none` sem um contorno
  igualmente visível no lugar).
- Toda imagem com `alt` descritivo (ou `alt=""` se for puramente decorativa).
- Todo controle de formulário com `<label>` associado.
- Elementos interativos sempre operáveis só de teclado, sem depender de
  `:hover`.
- Respeitar `prefers-reduced-motion` — nenhuma animação obrigatória para
  entender o conteúdo.
- Conteúdo dinâmico (saída do código Python, mensagens de status) em região
  `aria-live="polite"`.
- Nunca comunicar informação só por cor.
- Vídeo de aula gravada (quando adicionado no futuro) precisa ter link para
  transcrição ou legenda.

## Padrão do editor Python embutido (Pyodide)

- Sempre o par: `<textarea>` (nunca um editor tipo Monaco/CodeMirror) +
  botão "Executar" + região de saída com `aria-live="polite"`, com aparência
  de terminal (fundo levemente diferente, fonte monoespaçada) — **sem
  `<iframe>`**, embutido direto na página.
- Carregar o script do Pyodide só quando a pessoa interage pela primeira vez
  com algum editor da página (lazy load), com uma mensagem de status visível
  e anunciada ("Carregando Python…" → "Pronto."). Uma vez carregado, fica em
  memória para os próximos cliques em qualquer editor da mesma página.
- O Pyodide **não** liga `input()` a `window.prompt()` por padrão, e o
  mecanismo de stdin do próprio Pyodide não repassa a mensagem do `input()`
  para a caixa de diálogo (ela abriria vazia). Por isso `builtins.input` é
  sobrescrito diretamente: a versão personalizada chama uma função JS
  exposta via `pyodide.globals.set("pedir_entrada_do_usuario", ...)`, que
  escreve a mensagem na área de saída do editor **antes** de chamar
  `window.prompt(mensagem)` — assim a pergunta aparece tanto na caixa de
  diálogo quanto no histórico da área de saída, mesmo depois que o diálogo
  fechar. Essa função é revinculada a cada execução (não só uma vez), pois
  a instância do Pyodide é compartilhada entre todos os editores da página
  e cada execução precisa escrever na área de saída certa. `window.prompt()`
  é nativamente acessível. Clicar em "Cancelar" retorna `null`, que vira
  `EOFError` no Python — tratar esse caso mostrando "Execução cancelada."
  na área de saída em vez de um traceback cru.
- A execução do Python roda sempre na thread principal da página (nunca em
  Web Worker): rodar em Worker quebraria o `input()`, porque
  `SharedArrayBuffer`/`Atomics.wait` (necessário para bloquear o worker
  esperando resposta do usuário) exige os cabeçalhos
  `Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy`, que o GitHub
  Pages não permite configurar. Os exercícios das aulas são scripts curtos,
  sem risco real de travar a interface por tempo perceptível.
- Esse editor só faz sentido para conteúdo de entrada/saída de texto (aulas
  1 a 8). Não tentar rodar pygame no navegador nas aulas 9 em diante — não
  resolveria acessibilidade nenhuma (o problema de "pixels sem leitura de
  tela" é o mesmo dentro ou fora do navegador) e adicionaria complexidade
  sem ganho real.

## Padrão do link de feedback/dúvida

- Sempre um link `mailto:`, nunca um formulário com serviço externo.
- Assunto pré-preenchido no formato `Aula XX - Nome da atividade`.
- Texto ao lado do link instruindo o aluno a completar o assunto com o
  próprio nome antes de enviar.
- Sempre mostrar também o endereço de e-mail como texto simples e
  selecionável, como alternativa caso o `mailto:` não abra nenhum aplicativo
  no dispositivo do aluno.
- O endereço do professor fica em uma única constante reaproveitada em todo
  o site — nunca copiado em vários arquivos. Até o professor informar o
  endereço definitivo, usar o placeholder `professor@substituir.com.br`.

## Fluxo de trabalho obrigatório

- Antes de implementar algo novo (uma aula futura, um novo componente),
  escrever um resumo curto do que vai ser criado, quais arquivos serão
  tocados e o que fica fora do escopo — só depois começar a implementar.
  Vale mesmo quando a tarefa parecer simples.
- Ao final de cada tarefa, revisar o checklist de acessibilidade acima antes
  de considerar concluído.

## Fonte do conteúdo pedagógico

O conteúdo de cada aula segue sempre esta estrutura: Objetivos → Pílula da
aula → O que vamos ver → Exercícios (Fácil / Avançado / Pesquisa) → Desafio
da semana → Nota de acessibilidade (quando houver) → Continue estudando.
Essa estrutura vem da ementa do curso (documento de trabalho do professor,
fora deste repositório) e deve se manter igual em todas as aulas futuras.

## Padrão de exercícios (vale para toda aula a partir da Aula 2)

Cada página de aula tem **13 exercícios**, divididos em dois grupos:

### Grupo 1 — Exercícios essenciais (3 por aula)

Refletem o conteúdo central da aula. Quem fizer só estes três já revisou o
essencial. Cada um tem:
- Enunciado claro, com exemplo do que a saída deveria parecer.
- Editor Python embutido, com código inicial parcialmente preenchido
  (nunca em branco — o aluno completa, não começa do zero).
- Um bloco `<details>` com o resumo "Dica" (nunca a resposta pronta).
- Link de feedback `mailto:` no padrão já definido neste arquivo.

### Grupo 2 — Exercícios de prática (10 por aula)

Para quem quer treinar mais, em ordem crescente de dificuldade. Cada um
tem enunciado, editor embutido e código inicial. **Um único link de
feedback para o grupo inteiro**, no fim da seção — não um por exercício
(13 links de e-mail na mesma página vira ruído, principalmente na
navegação por leitor de tela).

Os 10 exercícios de prática ficam dentro de elementos `<details>`
(recolhidos por padrão), com o título do exercício no `<summary>`. Motivo:
mantém a página navegável e evita 13 editores abertos de uma vez. `<details>`
é elemento nativo do HTML e já acessível por teclado e leitor de tela — não
substituir por acordeão feito em JavaScript.

No início da seção de prática, incluir uma lista de links internos
("Sumário dos exercícios") apontando para cada um, para navegação rápida.

### Regras de conteúdo dos exercícios

- **Temas criativos, não matemáticos.** Evitar "calcule a média de N
  números" como padrão. Preferir: jogos (RPG, inventário, dados, jogo da
  velha, pontuação), histórias e aventuras de texto, situações cotidianas
  de quem programa (fila de bugs, playlist, senha, mensagens de commit,
  agenda), coisas absurdas e divertidas (gerador de nome de banda, desculpa
  aleatória para bug, oráculo de decisões). Matemática só quando for o
  ponto do exercício, nunca como tema padrão.
- **Conteúdo acumulativo.** Cada aula reaproveita o que já foi ensinado nas
  anteriores. A partir da Aula 3, exercícios podem e devem combinar
  variáveis + `input`/`print` (Aula 2) com o conteúdo novo. Nunca usar
  recurso que ainda não foi ensinado (ex.: não usar `while` antes da Aula
  6, não usar funções definidas pelo aluno antes da Aula 7, não usar
  `try/except` antes da Aula 12).
- **Biblioteca `random`:** pode ser usada livremente a partir da Aula 3
  (`random.choice`, `random.randint`, `random.shuffle`, `random.sample`).
  Funciona perfeitamente no editor do site.
- **Biblioteca `time`:** **não usar `time.sleep()` nos exercícios do
  site.** O Pyodide roda na thread principal, então `sleep` congela a aba
  inteira e o leitor de tela fica mudo durante a pausa. `time.sleep()` só
  pode aparecer nos **desafios da semana**, que o aluno roda no Thonny
  local. Se precisar de hora/data no site, `time.strftime()` e
  `time.localtime()` são seguros (não pausam nada).
- **Todos os nomes em português**, seguindo a convenção deste arquivo —
  inclusive dentro do código dos exercícios (`vidas`, `inventario`,
  `sortear_inimigo`).
- **Acessibilidade do enunciado:** quando o exercício produzir saída
  visual em "arte ASCII" ou depender de alinhamento na tela, sempre
  oferecer uma variação em texto corrido como alternativa equivalente —
  nunca um exercício que só faz sentido enxergando.

### Padrão do desafio da semana

O desafio da semana é a peça mais importante da página (vira portfólio no
GitHub) e precisa ser **bem mais detalhado** que os exercícios. Estrutura
fixa:

1. **O que você vai construir** — descrição do projeto em 2–3 frases.
2. **Por que isso é interessante** — uma frase ligando ao mundo real ou a
   jogos.
3. **Requisitos mínimos** — lista numerada e objetiva do que precisa
   funcionar para o desafio estar completo.
4. **Exemplo de execução** — bloco de código mostrando um diálogo real do
   programa rodando (entrada e saída), para o aluno saber exatamente o que
   está perseguindo.
5. **Vá além (opcional)** — 3 a 5 ideias de incremento para quem terminar
   rápido e quiser turbinar.
6. **Como entregar** — nome sugerido do arquivo (em português, kebab-case),
   e o passo a passo de subir no GitHub pela interface web.
7. **Checklist de conclusão** — lista de itens marcáveis para o aluno
   conferir antes de considerar pronto.

