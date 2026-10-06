// =============================================================
// main.js — Código comum a todas as páginas
//  • sessão do cliente (sessionStorage / localStorage)
//  • proteção das páginas internas (só entra quem fez login)
//  • navbar com nome e foto do cliente (US02)
//  • notificações, modo escuro e status das APIs
// =============================================================

import { buscarCotacoes, carregarDadosDoCliente, verificarJsonServer } from "./api.js";
import { gerarNotificacoes, renderizarNotificacoes } from "./notificacoes.js";
import { conteudoAvatar, escaparHtml, formatarMoeda, formatarPercentual, mostrarAviso } from "./render.js";

export const RAIZ = location.pathname.includes("/pages/") ? "../" : "";
export const PAGINA_LOGIN = `${RAIZ}pages/login.html`;
export const PAGINA_INICIAL = `${RAIZ}index.html`;

// Ano atual no rodapé
document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

// ---------- Sessão (US01) ----------
// Sem "Lembrar-me": sessionStorage (some ao fechar o navegador).
// Com "Lembrar-me": localStorage (continua salvo no dispositivo).
// Guardamos só o necessário para identificar o cliente — nunca a senha.

const CHAVE_SESSAO = "sq:sessao";

export function obterSessao() {
  const texto = sessionStorage.getItem(CHAVE_SESSAO) || localStorage.getItem(CHAVE_SESSAO);
  return texto ? JSON.parse(texto) : null;
}

export function salvarSessao(cliente, lembrar = false) {
  const sessao = { id: cliente.id, nome: cliente.nome, email: cliente.email, inicio: new Date().toISOString() };
  encerrarSessao();
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_SESSAO);
}

export function sessaoLembrada() {
  return localStorage.getItem(CHAVE_SESSAO) !== null;
}

// ---------- Senha ----------
// A senha nunca é gravada em texto puro no db.json: guardamos o "hash"
// SHA-256 dela (Web Crypto API, nativa do navegador).
export async function gerarHash(texto) {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(resumo)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Modo escuro (US11) ----------
export function aplicarTema(escuro) {
  document.documentElement.dataset.tema = escuro ? "escuro" : "claro";
  document.documentElement.dataset.bsTheme = escuro ? "dark" : "light"; // modo de cor do Bootstrap 5.3
  localStorage.setItem("sq:tema", escuro ? "escuro" : "claro");
}

// ---------- Chip de status da navbar ----------
async function preencherChip() {
  const chip = document.querySelector("[data-chip]");
  if (!chip) return;

  if (chip.dataset.chip === "api") {
    const { online } = await verificarJsonServer();
    chip.classList.toggle("chip-offline", !online);
    chip.innerHTML = online
      ? '<span class="ponto"></span> Dados sincronizados'
      : '<span class="ponto"></span> JSON Server offline';
    return;
  }

  // chip "usd": cotação atual do dólar
  try {
    const { moedas } = await buscarCotacoes();
    const dolar = moedas.find((m) => m.codigo === "USD");
    const subiu = dolar.variacao >= 0;
    chip.innerHTML = `USD/BRL <strong class="text-body">${formatarMoeda(dolar.valor)}</strong>
      <i class="bi ${subiu ? "bi-graph-up-arrow text-primary" : "bi-graph-down-arrow text-danger"}"
         title="${formatarPercentual(dolar.variacao, 2)} hoje"></i>`;
  } catch {
    chip.classList.add("chip-offline");
    chip.innerHTML = '<span class="ponto"></span> Cotação indisponível';
  }
}

// ---------- Navbar ----------
function preencherUsuario(cliente) {
  document.querySelectorAll("[data-usuario-avatar]").forEach((el) => (el.innerHTML = conteudoAvatar(cliente)));
  document.querySelectorAll("[data-usuario-nome]").forEach((el) => (el.textContent = cliente.nome));
  document.querySelectorAll("[data-usuario-email]").forEach((el) => (el.textContent = cliente.email));
}

// Atualiza navbar e notificações com os dados mais recentes.
// As páginas chamam de novo depois de cada cadastro/edição/exclusão.
export function atualizarLayout(dados) {
  preencherUsuario(dados.cliente);
  renderizarNotificacoes(gerarNotificacoes(dados), dados.cliente.id);
}

// ---------- Inicialização das páginas internas ----------
export async function iniciarPagina() {
  const sessao = obterSessao();
  if (!sessao) {
    location.replace(PAGINA_LOGIN);
    return new Promise(() => {}); // interrompe a página enquanto redireciona
  }

  // Botões "Sair"
  document.querySelectorAll("[data-sair]").forEach((link) =>
    link.addEventListener("click", () => encerrarSessao())
  );

  // Mostra o nome da sessão enquanto os dados chegam do servidor
  preencherUsuario({ nome: sessao.nome, email: sessao.email });
  preencherChip();

  try {
    const dados = await carregarDadosDoCliente(sessao.id);
    aplicarTema(Boolean(dados.cliente.preferencias?.modoEscuro));
    atualizarLayout(dados);
    return dados;
  } catch (erro) {
    if (erro.status === 404) {
      // A conta não existe mais no db.json
      encerrarSessao();
      location.replace(PAGINA_LOGIN);
      return new Promise(() => {});
    }
    mostrarFalhaConexao(erro.message);
    throw erro;
  }
}

// Quando o JSON Server está desligado, a página avisa em vez de mostrar dados falsos
export function mostrarFalhaConexao(mensagem) {
  const main = document.querySelector("main .limite-conteudo");
  if (main && !document.querySelector("#alertaConexao")) {
    main.insertAdjacentHTML(
      "afterbegin",
      `<div class="alert alert-danger d-flex align-items-start gap-2 mb-4" id="alertaConexao" role="alert">
         <i class="bi bi-plug fs-5"></i>
         <div>
           <strong>Sem conexão com o banco de dados.</strong> ${escaparHtml(mensagem)}
           <button type="button" class="btn btn-sm btn-danger ms-2" onclick="location.reload()">Tentar de novo</button>
         </div>
       </div>`
    );
  }
  mostrarAviso(mensagem, "erro");
}
