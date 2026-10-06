// =============================================================
// comprovante.js — Upload do comprovante no modal de Nova Movimentação
// (US07: "deve haver um campo para anexar imagem (JPG/PNG) ou PDF")
//
// O cartão com o nome do arquivo só aparece DEPOIS que o usuário
// escolhe um arquivo (clicando ou arrastando para a área tracejada).
// =============================================================

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "application/pdf"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB em bytes

const inputArquivo = document.querySelector("#comprovante");
const dropzone = document.querySelector("#dropzoneComprovante");
const cartao = document.querySelector("#arquivoAnexo");
const nomeArquivo = document.querySelector("#nomeArquivo");
const infoArquivo = document.querySelector("#infoArquivo");
const iconeArquivo = document.querySelector("#iconeArquivo");
const botaoRemover = document.querySelector("#removerArquivo");
const mensagemErro = document.querySelector("#erroComprovante");
const modal = document.querySelector("#modalNovaMovimentacao");

// Converte bytes para um texto legível (ex.: 1.2 MB, 350 KB)
function formatarTamanho(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function mostrarErro(texto) {
  mensagemErro.textContent = texto;
  mensagemErro.classList.remove("d-none");
}

function limparComprovante() {
  inputArquivo.value = ""; // esvazia a seleção do input
  cartao.classList.add("d-none");
  mensagemErro.classList.add("d-none");
}

function exibirComprovante(arquivo) {
  mensagemErro.classList.add("d-none");

  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    limparComprovante();
    mostrarErro("Formato não aceito. Envie um arquivo JPG, PNG ou PDF.");
    return;
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    limparComprovante();
    mostrarErro(`O arquivo tem ${formatarTamanho(arquivo.size)}. O limite é 5 MB.`);
    return;
  }

  // Ícone de acordo com o tipo do arquivo
  const ehPdf = arquivo.type === "application/pdf";
  iconeArquivo.className = `bi ${ehPdf ? "bi-file-earmark-pdf" : "bi-file-earmark-image"} fs-4 text-primary`;

  nomeArquivo.textContent = arquivo.name;
  infoArquivo.textContent = `${formatarTamanho(arquivo.size)} • Pronto para envio`;
  cartao.classList.remove("d-none");
}

// 1) Arquivo escolhido pelo seletor do computador
inputArquivo.addEventListener("change", () => {
  const arquivo = inputArquivo.files[0];
  if (arquivo) exibirComprovante(arquivo);
  else limparComprovante();
});

// 2) Arrastar e soltar na área tracejada
dropzone.addEventListener("dragover", (evento) => {
  evento.preventDefault(); // sem isso o navegador abriria o arquivo
  dropzone.classList.add("arrastando");
});

dropzone.addEventListener("dragleave", () => dropzone.classList.remove("arrastando"));

dropzone.addEventListener("drop", (evento) => {
  evento.preventDefault();
  dropzone.classList.remove("arrastando");
  const arquivos = evento.dataTransfer.files;
  if (arquivos.length === 0) return;
  inputArquivo.files = arquivos; // coloca o arquivo no input, como se fosse clicado
  exibirComprovante(arquivos[0]);
});

// 3) Botão "X" do cartão remove o arquivo
botaoRemover.addEventListener("click", limparComprovante);

// 4) Ao fechar o modal, a seleção é descartada (evento do Bootstrap)
modal.addEventListener("hidden.bs.modal", limparComprovante);
