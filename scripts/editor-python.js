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

  // O Pyodide nao liga input() a window.prompt() por padrao, e o mecanismo
  // de stdin do proprio Pyodide nao repassa a mensagem do input() para a
  // caixa de dialogo. Por isso sobrescrevemos builtins.input diretamente:
  // a versao personalizada chama a funcao JS "pedir_entrada_do_usuario"
  // (revinculada a cada execucao em executarCodigo, para escrever na area
  // de saida do editor certo) passando a mensagem adiante. Retorno null
  // (Cancelar) vira EOFError, tratado como mensagem amigavel em
  // executarCodigo(). Isso so precisa ser configurado uma vez por
  // instancia do Pyodide, nao a cada clique em "Executar".
  function configurarEntradaPersonalizada(pyodide) {
    pyodide.runPython(`
import builtins

def _entrada_personalizada(mensagem=""):
    resposta = pedir_entrada_do_usuario(mensagem)
    if resposta is None:
        raise EOFError("Execucao cancelada.")
    return resposta

builtins.input = _entrada_personalizada
`);
  }

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
          .then(function (pyodide) {
            configurarEntradaPersonalizada(pyodide);
            resolve(pyodide);
          })
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

    // Revincula o bridge do input() a este editor especifico: a instancia
    // do Pyodide e compartilhada entre todos os editores da pagina, entao
    // precisamos garantir que a pergunta apareca na area de saida correta.
    pyodide.globals.set("pedir_entrada_do_usuario", function (mensagem) {
      saida += mensagem;
      areaDeSaida.textContent = saida;
      const resposta = window.prompt(mensagem);
      if (resposta !== null) {
        saida += resposta + "\n";
        areaDeSaida.textContent = saida;
      }
      return resposta;
    });

    try {
      await pyodide.runPythonAsync(codigo);
      areaDeSaida.textContent =
        saida || "(o programa rodou sem imprimir nada na tela)";
    } catch (erro) {
      const mensagemErro = String(erro);
      if (mensagemErro.includes("EOFError")) {
        areaDeSaida.textContent = saida + "Execução cancelada.";
      } else {
        areaDeSaida.textContent = saida + mensagemErro;
      }
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
