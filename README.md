# Curso Python — Jogos e Acessibilidade

Site de apoio do curso **"Introdução à Programação com Python: Lógica,
Jogos e Acessibilidade"** — curso online, 15 aulas semanais de 2h, para
jovens a partir de 16 anos, sem exigência de conhecimento prévio.

O curso apresenta a linguagem Python, desenvolve lógica de programação e
constrói, ao longo das aulas, um jogo chamado **Invasão Alienígena**
(inspirado em Space Invaders), com um modo pensado desde o início para
funcionar bem para uma pessoa sem visão. Acessibilidade é critério de
aceite em toda página e todo exercício deste site.

## Como abrir o site

Este é um site estático, sem etapa de build e sem dependências para
instalar. Basta abrir o arquivo `index.html` diretamente no navegador.

## Estrutura do repositório

```
index.html                              Página inicial
aulas/
  aula-01-apresentacao/                 Aula 1
  aula-02-primeiro-programa/            Aula 2, com editor Python interativo
recursos/
  guia-instalacao.html                  Guia de instalação (Python + Thonny)
estilos/
  estilo-principal.css                  CSS global do site
scripts/
  editor-python.js                      Componente do editor Python (Pyodide)
  endereco-professor.js                 Endereço de contato e blocos de feedback
```

## Tecnologia

HTML5 semântico + CSS puro + JavaScript vanilla. O editor Python embutido
usa [Pyodide](https://pyodide.org/) carregado por CDN, sob demanda. Sem
React, Vue, jQuery, bundlers, cookies ou analytics de terceiros. Publicado
no GitHub Pages.

## Licença

Este projeto está sob a licença MIT — veja o arquivo [LICENSE](LICENSE).
