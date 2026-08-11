// Endereco de e-mail do professor, centralizado em um unico lugar.
// Ate o professor informar o endereco definitivo, usamos um placeholder.
const ENDERECO_PROFESSOR = "professor@substituir.com.br";

function montarBlocosFeedback() {
  const blocos = document.querySelectorAll(".bloco-feedback[data-assunto]");

  blocos.forEach(function (bloco) {
    const assunto = bloco.getAttribute("data-assunto");
    const link = bloco.querySelector(".bloco-feedback__link");
    const endereco = bloco.querySelector(".bloco-feedback__endereco");
    const assuntoCodificado = encodeURIComponent(assunto);

    if (link) {
      link.href =
        "mailto:" + ENDERECO_PROFESSOR + "?subject=" + assuntoCodificado;
    }

    if (endereco) {
      endereco.textContent = ENDERECO_PROFESSOR;
    }
  });
}

document.addEventListener("DOMContentLoaded", montarBlocosFeedback);
