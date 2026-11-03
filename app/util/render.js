// =============================================================
// render.js — Formatação e pedaços de HTML reaproveitados
// (manipulação do DOM usada por todas as páginas)
// =============================================================

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoNumero = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 1234.5 → "R$ 1.234,50"
export function formatarMoeda(valor) {
  return formatoMoeda.format(valor || 0);
}

// 1234.5 → "1.234,50" (sem o "R$", usado dentro dos campos)
export function formatarNumero(valor) {
  return formatoNumero.format(valor || 0);
}

// Valor com sinal: "+ R$ 10,00" ou "- R$ 10,00"
export function formatarComSinal(valor, tipo) {
  return `${tipo === "RECEITA" ? "+" : "-"} ${formatarMoeda(Math.abs(valor))}`;
}

// 12.345 → "12,3%"
export function formatarPercentual(valor, casas = 1) {
  return `${valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas })}%`;
}

// "2026-10-05" → "05/10/2026"
export function formatarData(dataIso) {
  if (!dataIso) return "–";
  const [ano, mes, dia] = dataIso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

// "2026-10" → "Outubro / 2026"
export function formatarMes(anoMes) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} / ${ano}`;
}

// Data e hora completas de um ISO: "05/10/2026 às 14:22"
export function formatarDataHora(iso) {
  const data = new Date(iso);
  return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

// Evita que um texto digitado pelo usuário vire HTML (proteção contra XSS)
export function escaparHtml(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// "Lucas Oliveira da Silva" → "LS"
export function obterIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

// Conteúdo do avatar: a foto (se o cliente enviou) ou as iniciais do nome
export function conteudoAvatar(cliente) {
  if (cliente.foto) {
    return `<img src="${cliente.foto}" alt="Foto de ${escaparHtml(cliente.nome)}" />`;
  }
  return `<span class="avatar-iniciais" aria-hidden="true">${escaparHtml(obterIniciais(cliente.nome))}</span>`;
}

// Selo colorido da categoria (usado nas tabelas)
export function badgeCategoria(categoria) {
  if (!categoria) {
    return `<span class="badge-categoria cat-neutro"><i class="bi bi-question-circle"></i> Sem categoria</span>`;
  }
  return `<span class="badge-categoria cat-${categoria.cor}"><i class="bi ${categoria.icone}"></i> ${escaparHtml(categoria.nome)}</span>`;
}

// Bloco de "estado vazio": aparece quando ainda não há nada cadastrado
export function estadoVazio({ icone, titulo, texto, acao = "" }) {
  return `
    <div class="estado-vazio">
      <span class="icone-tile tile-neutro rounded-circle"><i class="bi ${icone}"></i></span>
      <strong>${titulo}</strong>
      <p>${texto}</p>
      ${acao}
    </div>`;
}

// Aviso rápido no canto da tela (componente Toast do Bootstrap)
export function mostrarAviso(mensagem, tipo = "sucesso") {
  let area = document.querySelector("#areaAvisos");
  if (!area) {
    area = document.createElement("div");
    area.id = "areaAvisos";
    area.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.append(area);
  }

  const icones = { sucesso: "bi-check-circle-fill", erro: "bi-exclamation-octagon-fill", info: "bi-info-circle-fill" };
  const aviso = document.createElement("div");
  aviso.className = `toast aviso-${tipo}`;
  aviso.setAttribute("role", tipo === "erro" ? "alert" : "status");
  aviso.innerHTML = `
    <div class="d-flex align-items-start gap-2 p-3">
      <i class="bi ${icones[tipo]} fs-5"></i>
      <div class="flex-grow-1">${escaparHtml(mensagem)}</div>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>`;
  area.append(aviso);

  const toast = new bootstrap.Toast(aviso, { delay: tipo === "erro" ? 7000 : 3500 });
  aviso.addEventListener("hidden.bs.toast", () => aviso.remove());
  toast.show();
}

// Liga/desliga o "carregando" de um botão durante uma requisição
export function botaoCarregando(botao, carregando, texto = "Salvando...") {
  if (carregando) {
    botao.dataset.textoOriginal = botao.innerHTML;
    botao.disabled = true;
    botao.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ${texto}`;
  } else {
    botao.disabled = false;
    if (botao.dataset.textoOriginal) botao.innerHTML = botao.dataset.textoOriginal;
  }
}
