// =============================================================
// paginas/login.js — Login (US01) e cadastro de conta
// =============================================================

import { api, buscarCotacoes, verificarJsonServer } from "../api.js";
import { gerarHash, obterSessao, PAGINA_INICIAL, salvarSessao } from "../main.js";
import { botaoCarregando, formatarMoeda, formatarPercentual } from "../render.js";
import { limparAoDigitar, limparValidacao, REGEX, validarCampos } from "../validacao.js";

// Quem já está logado vai direto para o Dashboard
if (obterSessao()) location.replace(PAGINA_INICIAL);

const painelLogin = document.querySelector("#painelLogin");
const painelCadastro = document.querySelector("#painelCadastro");
const formLogin = document.querySelector("#formLogin");
const formCadastro = document.querySelector("#formCadastro");
const erroAcesso = document.querySelector("#erroAcesso");

function mostrarErro(mensagem) {
  erroAcesso.textContent = mensagem;
  erroAcesso.classList.remove("d-none");
}

function esconderErro() {
  erroAcesso.classList.add("d-none");
}

// ---------- Alternar entre login e cadastro ----------
function mostrarPainel(nome) {
  esconderErro();
  painelLogin.classList.toggle("d-none", nome !== "login");
  painelCadastro.classList.toggle("d-none", nome !== "cadastro");
  limparValidacao(formLogin);
  limparValidacao(formCadastro);
  (nome === "login" ? formLogin : formCadastro).querySelector("input").focus();
}

document.querySelectorAll("[data-alternar]").forEach((link) =>
  link.addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarPainel(link.dataset.alternar);
  })
);
if (location.hash === "#cadastro") mostrarPainel("cadastro");

// ---------- Mostrar / esconder senha ----------
document.querySelectorAll("[data-ver-senha]").forEach((botao) =>
  botao.addEventListener("click", () => {
    const campo = document.getElementById(botao.dataset.verSenha);
    const mostrando = campo.type === "text";
    campo.type = mostrando ? "password" : "text";
    botao.innerHTML = `<i class="bi ${mostrando ? "bi-eye" : "bi-eye-slash"}"></i>`;
    botao.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Esconder senha");
  })
);

limparAoDigitar(formLogin);
limparAoDigitar(formCadastro);

// ---------- Login: GET /clientes?email=... ----------
formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  esconderErro();

  const email = formLogin.querySelector("#email");
  const senha = formLogin.querySelector("#senha");
  const valido = validarCampos([
    { campo: email, valido: REGEX.email.test(email.value.trim()), mensagem: "Informe um e-mail válido (ex.: nome@dominio.com)." },
    { campo: senha, valido: senha.value.length > 0, mensagem: "Informe a sua senha." },
  ]);
  if (!valido) return;

  const botao = formLogin.querySelector("[type=submit]");
  botaoCarregando(botao, true, "Entrando...");

  try {
    const [cliente] = await api.listar("clientes", { email: email.value.trim().toLowerCase() });
    const hash = await gerarHash(senha.value);

    if (!cliente || cliente.senhaHash !== hash) {
      mostrarErro("E-mail ou senha incorretos.");
      senha.value = "";
      senha.focus();
      return;
    }

    salvarSessao(cliente, formLogin.querySelector("#lembrar").checked);
    location.href = PAGINA_INICIAL;
  } catch (erro) {
    mostrarErro(erro.message);
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Cadastro: POST /clientes ----------
formCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  esconderErro();

  const nome = formCadastro.querySelector("#cadNome");
  const email = formCadastro.querySelector("#cadEmail");
  const senha = formCadastro.querySelector("#cadSenha");
  const confirmar = formCadastro.querySelector("#cadConfirmar");

  const valido = validarCampos([
    { campo: nome, valido: REGEX.nomeCompleto.test(nome.value.trim()), mensagem: "Informe nome e sobrenome, apenas com letras." },
    { campo: email, valido: REGEX.email.test(email.value.trim()), mensagem: "Informe um e-mail válido (ex.: nome@dominio.com)." },
    { campo: senha, valido: REGEX.senha.test(senha.value), mensagem: "A senha precisa de 6 caracteres ou mais, com letras e números." },
    { campo: confirmar, valido: confirmar.value === senha.value && confirmar.value !== "", mensagem: "As senhas não conferem." },
  ]);
  if (!valido) return;

  const botao = formCadastro.querySelector("[type=submit]");
  botaoCarregando(botao, true, "Criando conta...");

  try {
    const emailNormalizado = email.value.trim().toLowerCase();
    const existentes = await api.listar("clientes", { email: emailNormalizado });
    if (existentes.length) {
      validarCampos([{ campo: email, valido: false, mensagem: "Já existe uma conta com este e-mail." }]);
      return;
    }

    const agora = new Date().toISOString();
    const cliente = await api.criar("clientes", {
      nome: nome.value.trim().replace(/\s+/g, " "),
      email: emailNormalizado,
      senhaHash: await gerarHash(senha.value),
      profissao: "",
      telefone: "",
      bio: "",
      foto: null,
      preferencias: { alertas: true, modoEscuro: false, cotacoesAuto: true, lembreteComprovante: true },
      criadoEm: agora,
      atualizadoEm: agora,
    });

    salvarSessao(cliente, false);
    location.href = PAGINA_INICIAL;
  } catch (erro) {
    mostrarErro(erro.message);
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Painel de apresentação: dados reais ----------
async function carregarCotacoes() {
  const area = document.querySelector("#cotacoesLogin");
  try {
    const { moedas } = await buscarCotacoes();
    area.innerHTML = moedas
      .map((m) => {
        const subiu = m.variacao >= 0;
        return `
          <div class="d-flex justify-content-between align-items-center">
            <span class="cotacao-mini"><span class="moeda">${m.codigo}</span> ${m.nome}</span>
            <span class="mono fw-semibold">${formatarMoeda(m.valor)}
              <small class="${subiu ? "text-primary" : "text-danger"} ms-1">
                <i class="bi ${subiu ? "bi-caret-up-fill" : "bi-caret-down-fill"}"></i>${formatarPercentual(Math.abs(m.variacao), 2)}
              </small>
            </span>
          </div>`;
      })
      .join("");
    const hora = new Date(Math.max(...moedas.map((m) => m.atualizadoEm)));
    document.querySelector("#horaCotacao").textContent = hora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch (erro) {
    area.innerHTML = `<span class="small text-danger"><i class="bi bi-wifi-off me-1"></i>${erro.message}</span>`;
  }
}

async function verificarServidor() {
  const { online } = await verificarJsonServer();
  document.querySelector("#statusServidor").innerHTML = online
    ? '<i class="bi bi-circle-fill text-primary me-1" style="font-size: 0.5rem"></i> JSON Server conectado'
    : '<i class="bi bi-circle-fill text-danger me-1" style="font-size: 0.5rem"></i> JSON Server offline';
  if (!online) mostrarErro("O JSON Server está desligado. No terminal do projeto, rode: npm run api");
}

carregarCotacoes();
verificarServidor();
