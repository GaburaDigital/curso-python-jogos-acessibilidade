// Endereco de e-mail do professor, centralizado em um unico lugar.
const ENDERECO_PROFESSOR = "gabura.nogueira@idm.org.br";

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

function montarContatoDoProfessor() {
  const links = document.querySelectorAll(".contato-do-professor");

  links.forEach(function (link) {
    link.href = "mailto:" + ENDERECO_PROFESSOR;
    link.textContent = ENDERECO_PROFESSOR;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  montarBlocosFeedback();
  montarContatoDoProfessor();
});
