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
