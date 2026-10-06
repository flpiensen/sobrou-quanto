// =============================================================
// paginas/perfil.js — Perfil (US10) e Preferências (US11)
// PATCH /clientes/:id
// =============================================================

import { api, buscarCotacoes, verificarJsonServer } from "../api.js";
import { aplicarTema, atualizarLayout, gerarHash, iniciarPagina, salvarSessao, sessaoLembrada } from "../main.js";
import { botaoCarregando, conteudoAvatar, formatarDataHora, mostrarAviso } from "../render.js";
import { aplicarMascaraTelefone, limparAoDigitar, limparValidacao, REGEX, validarCampos } from "../validacao.js";

let dados = { cliente: null, categorias: [], transacoes: [] };

const form = document.querySelector("#formPerfil");
const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#emailPerfil");
const campoProfissao = document.querySelector("#profissao");
const campoTelefone = document.querySelector("#telefone");
const campoBio = document.querySelector("#bio");

aplicarMascaraTelefone(campoTelefone);
limparAoDigitar(form);
campoBio.addEventListener("input", () => (document.querySelector("#contadorBio").textContent = campoBio.value.length));

// Salva campos do cliente e atualiza a tela inteira (inclusive a navbar)
async function salvarCliente(alteracoes) {
  const cliente = await api.atualizar("clientes", dados.cliente.id, { ...alteracoes, atualizadoEm: new Date().toISOString() });
  dados.cliente = cliente;
  salvarSessao(cliente, sessaoLembrada()); // mantém nome/e-mail da sessão em dia
  renderizarPerfil();
  atualizarLayout(dados);
  return cliente;
}

// ---------- Desenho ----------

function renderizarPerfil() {
  const { cliente } = dados;
  document.querySelector("#avatarPerfil").innerHTML = conteudoAvatar(cliente);
  document.querySelector("#perfilNome").textContent = cliente.nome;
  document.querySelector("#removerFoto").classList.toggle("d-none", !cliente.foto);

  const desde = new Date(cliente.criadoEm).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  document.querySelector("#membroDesde").textContent = `Membro desde ${desde}`;
  document.querySelector("#ultimaAlteracao").textContent = `Última alteração: ${formatarDataHora(cliente.atualizadoEm)}`;

  // Preferências (valores padrão para contas antigas)
  const preferencias = { alertas: true, modoEscuro: false, cotacoesAuto: true, lembreteComprovante: true, ...cliente.preferencias };
  document.querySelectorAll("[data-preferencia]").forEach((chave) => (chave.checked = preferencias[chave.dataset.preferencia]));
  document.querySelector("#rotuloTema").textContent = preferencias.modoEscuro ? "Escuro" : "Claro";
}

function preencherFormulario() {
  const { cliente } = dados;
  campoNome.value = cliente.nome;
  campoEmail.value = cliente.email;
  campoProfissao.value = cliente.profissao || "";
  campoTelefone.value = cliente.telefone || "";
  campoBio.value = cliente.bio || "";
  document.querySelector("#contadorBio").textContent = campoBio.value.length;
}

function renderizarSessao() {
  const lembrada = sessaoLembrada();
  document.querySelector("#chipSessao").innerHTML = `<i class="bi bi-hdd"></i> ${lembrada ? "localStorage" : "sessionStorage"}`;
  document.querySelector("#sessaoArmazenamento").textContent = `Armazenada em ${lembrada ? "localStorage" : "sessionStorage"}`;
  document.querySelector("#sessaoDescricao").textContent = lembrada
    ? "Você marcou \"Lembrar-me\": a sessão continua salva neste dispositivo até você sair."
    : "Encerrada automaticamente ao fechar a janela do navegador.";
}

// ---------- US10: dados cadastrais ----------

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nome = campoNome.value.trim().replace(/\s+/g, " ");
  const email = campoEmail.value.trim().toLowerCase();
  const telefone = campoTelefone.value.trim();

  const valido = validarCampos([
    { campo: campoNome, valido: REGEX.nomeCompleto.test(nome), mensagem: "Informe nome e sobrenome, apenas com letras." },
    { campo: campoEmail, valido: REGEX.email.test(email), mensagem: "Informe um e-mail válido." },
    { campo: campoTelefone, valido: !telefone || REGEX.telefone.test(telefone), mensagem: "Use o formato (11) 98765-4321." },
  ]);
  if (!valido) return;

  const botao = document.querySelector("#salvarPerfil");
  botaoCarregando(botao, true);

  try {
    // O e-mail é usado no login, então não pode repetir
    if (email !== dados.cliente.email) {
      const [outro] = await api.listar("clientes", { email });
      if (outro) {
        validarCampos([{ campo: campoEmail, valido: false, mensagem: "Este e-mail já é usado por outra conta." }]);
        return;
      }
    }

    await salvarCliente({ nome, email, telefone, profissao: campoProfissao.value.trim(), bio: campoBio.value.trim() });
    preencherFormulario();
    mostrarAviso("Dados cadastrais atualizados.");
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Foto de perfil ----------
// A imagem é reduzida para 256x256 num <canvas> antes de ir para o db.json
function reduzirImagem(arquivo, tamanho = 256) {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = tamanho;
      const lado = Math.min(imagem.width, imagem.height); // recorte quadrado no centro
      canvas
        .getContext("2d")
        .drawImage(imagem, (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado, 0, 0, tamanho, tamanho);
      URL.revokeObjectURL(imagem.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    imagem.onerror = () => reject(new Error("Não foi possível abrir essa imagem."));
    imagem.src = URL.createObjectURL(arquivo);
  });
}

document.querySelector("#novaFoto").addEventListener("change", async (evento) => {
  const arquivo = evento.target.files[0];
  evento.target.value = "";
  if (!arquivo) return;

  if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) {
    mostrarAviso("Envie uma imagem JPG, PNG ou WEBP.", "erro");
    return;
  }

  try {
    await salvarCliente({ foto: await reduzirImagem(arquivo) });
    mostrarAviso("Foto de perfil atualizada.");
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  }
});

document.querySelector("#removerFoto").addEventListener("click", async () => {
  try {
    await salvarCliente({ foto: null });
    mostrarAviso("Foto removida.");
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  }
});

// ---------- US11: preferências (salvas na hora) ----------

document.querySelectorAll("[data-preferencia]").forEach((chave) =>
  chave.addEventListener("change", async () => {
    const preferencias = { ...dados.cliente.preferencias, [chave.dataset.preferencia]: chave.checked };
    if (chave.dataset.preferencia === "modoEscuro") aplicarTema(chave.checked);

    try {
      await salvarCliente({ preferencias });
      mostrarAviso("Preferência salva.");
    } catch (erro) {
      chave.checked = !chave.checked; // desfaz se não conseguiu salvar
      if (chave.dataset.preferencia === "modoEscuro") aplicarTema(chave.checked);
      mostrarAviso(erro.message, "erro");
    }
  })
);

// ---------- Redefinir senha ----------

const formSenha = document.querySelector("#formSenha");
const modalSenhaElemento = document.querySelector("#modalSenha");
limparAoDigitar(formSenha);
modalSenhaElemento.addEventListener("hidden.bs.modal", () => {
  formSenha.reset();
  limparValidacao(formSenha);
});

formSenha.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const atual = document.querySelector("#senhaAtual");
  const nova = document.querySelector("#novaSenha");
  const confirmar = document.querySelector("#confirmarSenha");

  const valido = validarCampos([
    { campo: atual, valido: atual.value.length > 0, mensagem: "Informe a senha atual." },
    { campo: nova, valido: REGEX.senha.test(nova.value), mensagem: "A nova senha precisa de 6 caracteres ou mais, com letras e números." },
    { campo: confirmar, valido: confirmar.value === nova.value && confirmar.value !== "", mensagem: "As senhas não conferem." },
  ]);
  if (!valido) return;

  const botao = document.querySelector("#salvarSenha");
  botaoCarregando(botao, true);
  try {
    if ((await gerarHash(atual.value)) !== dados.cliente.senhaHash) {
      validarCampos([{ campo: atual, valido: false, mensagem: "Senha atual incorreta." }]);
      return;
    }
    await salvarCliente({ senhaHash: await gerarHash(nova.value) });
    bootstrap.Modal.getOrCreateInstance(modalSenhaElemento).hide();
    mostrarAviso("Senha alterada com sucesso.");
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Integrações: teste real das duas APIs ----------

function selo(online, textoOnline, textoOffline) {
  return online
    ? `<i class="bi bi-circle-fill" style="font-size: .4rem"></i> ${textoOnline}`
    : `<i class="bi bi-circle-fill text-danger" style="font-size: .4rem"></i> ${textoOffline}`;
}

async function testarIntegracoes() {
  const botao = document.querySelector("#testarPing");
  botao.disabled = true;

  const [json, awesome] = await Promise.all([
    verificarJsonServer(),
    buscarCotacoes({ forcar: true })
      .then(({ latencia }) => ({ online: true, latencia }))
      .catch(() => ({ online: false, latencia: null })),
  ]);

  document.querySelector("#statusJson").innerHTML = selo(json.online, "Conectado", "Offline");
  document.querySelector("#statusAwesome").innerHTML = selo(awesome.online, "Conectada", "Indisponível");
  const partes = [];
  if (json.online) partes.push(`JSON Server: ${json.latencia}ms`);
  if (awesome.online) partes.push(`AwesomeAPI: ${awesome.latencia}ms`);
  document.querySelector("#latencias").textContent = partes.length ? `Latência: ${partes.join(" • ")}` : "Sem resposta das APIs";
  botao.disabled = false;
}

document.querySelector("#testarPing").addEventListener("click", testarIntegracoes);

// ---------- Início ----------
renderizarSessao();
testarIntegracoes();
try {
  dados = await iniciarPagina();
  preencherFormulario();
  renderizarPerfil();
} catch {
  // O aviso de falha de conexão já foi exibido pelo main.js
}
