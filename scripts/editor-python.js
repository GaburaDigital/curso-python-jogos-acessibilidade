// Componente reutilizavel do editor Python embutido (Pyodide).
// Cada elemento com o atributo "data-editor-python" vira um editor
// independente: textarea + botao Executar + area de saida com
// aria-live="polite". O Pyodide e carregado sob demanda (lazy load) no
// primeiro clique em qualquer editor da pagina e depois fica em memoria
// para os proximos cliques, em qualquer editor.
(function () {
  const URL_PYODIDE =
    "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";

  let promessaPyodide = null;

  function carregarPyodide() {
    if (promessaPyodide) {
      return promessaPyodide;
    }

    promessaPyodide = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = URL_PYODIDE;
      script.onload = function () {
        window
          .loadPyodide()
          .then(resolve)
          .catch(reject);
      };
      script.onerror = function () {
        reject(
          new Error(
            "Nao foi possivel carregar o Python. Verifique sua conexao com a internet e tente novamente."
          )
        );
      };
      document.body.appendChild(script);
    });

    return promessaPyodide;
  }

  async function executarCodigo(pyodide, codigo, areaDeSaida) {
    let saida = "";

    pyodide.setStdout({
      batched: function (texto) {
        saida += texto + "\n";
      },
    });
    pyodide.setStderr({
      batched: function (texto) {
        saida += texto + "\n";
      },
    });

    try {
      await pyodide.runPythonAsync(codigo);
      areaDeSaida.textContent =
        saida || "(o programa rodou sem imprimir nada na tela)";
    } catch (erro) {
      areaDeSaida.textContent = saida + String(erro);
    }
  }

  function inicializarEditor(editor) {
    const textarea = editor.querySelector(".editor-python__codigo");
    const botao = editor.querySelector(".editor-python__executar");
    const areaDeSaida = editor.querySelector(".editor-python__saida");

    if (!textarea || !botao || !areaDeSaida) {
      return;
    }

    botao.addEventListener("click", async function () {
      const primeiroCarregamento = !promessaPyodide;

      botao.disabled = true;
      if (primeiroCarregamento) {
        areaDeSaida.textContent = "Carregando Python…";
      }

      try {
        const pyodide = await carregarPyodide();
        if (primeiroCarregamento) {
          areaDeSaida.textContent = "Pronto.";
        }
        await executarCodigo(pyodide, textarea.value, areaDeSaida);
      } catch (erro) {
        areaDeSaida.textContent = String(erro);
      } finally {
        botao.disabled = false;
      }
    });
  }

  function inicializarEditoresPython() {
    document
      .querySelectorAll("[data-editor-python]")
      .forEach(inicializarEditor);
  }

  document.addEventListener("DOMContentLoaded", inicializarEditoresPython);
})();
