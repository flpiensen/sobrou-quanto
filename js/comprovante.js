// =============================================================
// comprovante.js — Upload do comprovante no modal de movimentação
// (US07: "deve haver um campo para anexar imagem (JPG/PNG) ou PDF")
//
// O cartão com o nome do arquivo só aparece DEPOIS que o usuário
// escolhe um arquivo (clicando ou arrastando para a área tracejada).
// =============================================================

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "application/pdf"];
export const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB em bytes

// Converte bytes para um texto legível (ex.: 1.2 MB, 350 KB)
export function formatarTamanho(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

// Lê o arquivo e devolve o conteúdo em Base64 ("data URL"), que pode ser salvo no JSON
export function lerArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

// Abre um comprovante salvo (data URL) numa nova aba
export function abrirComprovante(conteudo) {
  // Navegadores bloqueiam abrir "data:" direto numa aba, então criamos um Blob
  fetch(conteudo)
    .then((resposta) => resposta.blob())
    .then((blob) => window.open(URL.createObjectURL(blob), "_blank"));
}

export function configurarComprovante() {
  const inputArquivo = document.querySelector("#comprovante");
  const dropzone = document.querySelector("#dropzoneComprovante");
  const cartao = document.querySelector("#arquivoAnexo");
  const nomeArquivo = document.querySelector("#nomeArquivo");
  const infoArquivo = document.querySelector("#infoArquivo");
  const iconeArquivo = document.querySelector("#iconeArquivo");
  const botaoRemover = document.querySelector("#removerArquivo");
  const mensagemErro = document.querySelector("#erroComprovante");

  // Estado: arquivo novo escolhido, comprovante já salvo (na edição) e se foi removido
  let arquivoNovo = null;
  let existente = null;
  let removido = false;

  function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.classList.remove("d-none");
  }

  function mostrarCartao(nome, tipo, tamanho, info) {
    const ehPdf = tipo === "application/pdf";
    iconeArquivo.className = `bi ${ehPdf ? "bi-file-earmark-pdf" : "bi-file-earmark-image"} fs-4 text-primary`;
    nomeArquivo.textContent = nome;
    infoArquivo.textContent = `${formatarTamanho(tamanho)} • ${info}`;
    cartao.classList.remove("d-none");
  }

  function limpar() {
    inputArquivo.value = ""; // esvazia a seleção do input
    arquivoNovo = null;
    existente = null;
    removido = false;
    cartao.classList.add("d-none");
    mensagemErro.classList.add("d-none");
  }

  function escolher(arquivo) {
    mensagemErro.classList.add("d-none");

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      inputArquivo.value = "";
      mostrarErro("Formato não aceito. Envie um arquivo JPG, PNG ou PDF.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      inputArquivo.value = "";
      mostrarErro(`O arquivo tem ${formatarTamanho(arquivo.size)}. O limite é 2 MB.`);
      return;
    }

    arquivoNovo = arquivo;
    mostrarCartao(arquivo.name, arquivo.type, arquivo.size, "Pronto para envio");
  }

  // 1) Arquivo escolhido pelo seletor do computador
  inputArquivo.addEventListener("change", () => {
    if (inputArquivo.files[0]) escolher(inputArquivo.files[0]);
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
    const arquivo = evento.dataTransfer.files[0];
    if (arquivo) escolher(arquivo);
  });

  // 3) Botão X: tira o arquivo
  botaoRemover.addEventListener("click", () => {
    inputArquivo.value = "";
    if (arquivoNovo && existente && !removido) {
      // Desistiu do arquivo novo: volta a mostrar o que já estava salvo
      arquivoNovo = null;
      mostrarCartao(existente.nome, existente.tipo, existente.tamanho, "Já anexado");
      return;
    }
    if (existente) removido = true;
    arquivoNovo = null;
    cartao.classList.add("d-none");
  });

  return {
    limpar,
    // Na edição, mostra o comprovante que já está salvo
    mostrarExistente(comprovante) {
      limpar();
      if (!comprovante) return;
      existente = comprovante;
      mostrarCartao(comprovante.nome, comprovante.tipo, comprovante.tamanho, "Já anexado");
    },
    obter() {
      return { arquivoNovo, removido };
    },
  };
}
