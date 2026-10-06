// =============================================================
// paginas/transacoes.js — Movimentações financeiras
// US07 (POST/PATCH), US08 (GET + filtros + importação CSV), US09 (DELETE)
// =============================================================

import { api } from "../api.js";
import { calcularTotais, hojeIso, mesAnterior, mesAtual, ordenarPorData, situacao } from "../calculos.js";
import { abrirComprovante, configurarComprovante, lerArquivo } from "../comprovante.js";
import { atualizarLayout, iniciarPagina } from "../main.js";
import {
  badgeCategoria,
  botaoCarregando,
  escaparHtml,
  estadoVazio,
  formatarComSinal,
  formatarData,
  formatarMes,
  formatarMoeda,
  formatarNumero,
  mostrarAviso,
} from "../render.js";
import { aplicarMascaraValor, converterValor, limparAoDigitar, limparValidacao, REGEX, validarCampos } from "../validacao.js";

const POR_PAGINA = 10;

let dados = { cliente: null, categorias: [], transacoes: [] };
let paginaAtual = 1;
let filtradas = [];
let idEmEdicao = null;
let idParaExcluir = null;
let linhasCsv = [];

// Elementos
const corpo = document.querySelector("#corpoExtrato");
const areaVazia = document.querySelector("#vazioExtrato");
const formFiltros = document.querySelector("#formFiltros");
const filtroBusca = document.querySelector("#filtroBusca");
const filtroPeriodo = document.querySelector("#filtroPeriodo");
const filtroTipo = document.querySelector("#filtroTipo");
const filtroCategoria = document.querySelector("#filtroCategoria");

const form = document.querySelector("#formMovimentacao");
const modalElemento = document.querySelector("#modalNovaMovimentacao");
const modal = bootstrap.Modal.getOrCreateInstance(modalElemento);
const modalExcluir = bootstrap.Modal.getOrCreateInstance(document.querySelector("#modalExcluir"));
const modalImportarElemento = document.querySelector("#modalImportar");
const modalImportar = bootstrap.Modal.getOrCreateInstance(modalImportarElemento);
const campoValor = document.querySelector("#valor");
const campoData = document.querySelector("#data");
const campoDescricao = document.querySelector("#descricao");
const campoCategoria = document.querySelector("#categoria");
const campoConta = document.querySelector("#conta");
const comprovante = configurarComprovante();

aplicarMascaraValor(campoValor);
limparAoDigitar(form);

const buscarCategoria = (id) => dados.categorias.find((c) => String(c.id) === String(id));
const buscarTransacao = (id) => dados.transacoes.find((t) => String(t.id) === String(id));

// Remove acentos e deixa minúsculo, para a busca achar "agua" em "Água"
const normalizar = (texto = "") => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

async function recarregarTransacoes() {
  dados.transacoes = await api.listar("transacoes", { clienteId: dados.cliente.id });
}

// ---------- Filtros (US08) ----------

function preencherFiltros() {
  filtroPeriodo.querySelector("[value=mes]").textContent = `Mês atual (${formatarMes(mesAtual()).replace(" /", "")})`;
  filtroPeriodo.querySelector("[value=anterior]").textContent = `Mês anterior (${formatarMes(mesAnterior(mesAtual())).replace(" /", "")})`;

  const selecionada = filtroCategoria.value;
  const temSemCategoria = dados.transacoes.some((t) => !buscarCategoria(t.categoriaId));
  filtroCategoria.innerHTML =
    '<option value="TODAS">Todas Categorias</option>' +
    [...dados.categorias]
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((c) => `<option value="${c.id}">${escaparHtml(c.nome)}</option>`)
      .join("") +
    (temSemCategoria ? '<option value="SEM">Sem categoria</option>' : "");
  filtroCategoria.value = [...filtroCategoria.options].some((o) => o.value === selecionada) ? selecionada : "TODAS";
}

function aplicarFiltros() {
  const termo = normalizar(filtroBusca.value);
  const periodo = filtroPeriodo.value;
  const hoje = hojeIso();
  const noventaDias = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

  return ordenarPorData(dados.transacoes).filter((t) => {
    if (periodo === "mes" && !t.data.startsWith(mesAtual())) return false;
    if (periodo === "anterior" && !t.data.startsWith(mesAnterior(mesAtual()))) return false;
    if (periodo === "90" && (t.data < noventaDias || t.data > hoje)) return false;
    if (filtroTipo.value !== "TODOS" && t.tipo !== filtroTipo.value) return false;
    if (filtroCategoria.value === "SEM" && buscarCategoria(t.categoriaId)) return false;
    if (!["TODAS", "SEM"].includes(filtroCategoria.value) && String(t.categoriaId) !== filtroCategoria.value) return false;
    if (termo && !normalizar(`${t.descricao} ${t.conta || ""}`).includes(termo)) return false;
    return true;
  });
}

// ---------- Desenho da tabela ----------

function linhaTabela(t) {
  const receita = t.tipo === "RECEITA";
  const estado = situacao(t);
  const selo =
    estado === "CONCLUIDA" ? "" : `<span class="badge-agendada">${estado === "AGENDADA" ? "Agendada" : "Prevista"}</span>`;
  const anexo = t.comprovante
    ? `<button type="button" class="btn-acao" data-ver-comprovante="${t.comprovante.id}" title="Abrir ${escaparHtml(t.comprovante.nome)}" aria-label="Abrir comprovante">
         <i class="bi ${t.comprovante.tipo === "application/pdf" ? "bi-file-earmark-pdf" : "bi-paperclip"} comprovante"></i>
       </button>`
    : '<span class="text-body-secondary" title="Sem comprovante">–</span>';

  return `
    <tr>
      <td class="data">${formatarData(t.data)}${selo}</td>
      <td><span class="descricao">${escaparHtml(t.descricao)}</span><span class="detalhe">${escaparHtml(t.conta || "")}</span></td>
      <td>${badgeCategoria(buscarCategoria(t.categoriaId))}</td>
      <td class="text-center"><span class="badge-tipo ${receita ? "receita" : "despesa"}">${receita ? "Receita" : "Despesa"}</span></td>
      <td class="text-center">${anexo}</td>
      <td class="valor text-end ${receita ? "valor-positivo" : "valor-negativo"}">${formatarComSinal(t.valor, t.tipo)}</td>
      <td class="text-center text-nowrap">
        <button type="button" class="btn-acao" data-editar="${t.id}" aria-label="Editar"><i class="bi bi-pencil"></i></button>
        <button type="button" class="btn-acao excluir" data-excluir="${t.id}" aria-label="Excluir"><i class="bi bi-trash3"></i></button>
      </td>
    </tr>`;
}

function renderizarPaginacao(totalPaginas) {
  const paginacao = document.querySelector("#paginacao");
  if (totalPaginas <= 1) {
    paginacao.innerHTML = "";
    return;
  }

  // Mostra no máximo 5 números ao redor da página atual
  const inicio = Math.max(1, Math.min(paginaAtual - 2, totalPaginas - 4));
  const fim = Math.min(totalPaginas, inicio + 4);
  let html = `<li class="page-item ${paginaAtual === 1 ? "disabled" : ""}">
      <button type="button" class="page-link" data-pagina="${paginaAtual - 1}" aria-label="Anterior"><i class="bi bi-chevron-left"></i></button></li>`;
  for (let p = inicio; p <= fim; p++) {
    html += `<li class="page-item ${p === paginaAtual ? "active" : ""}" ${p === paginaAtual ? 'aria-current="page"' : ""}>
      <button type="button" class="page-link" data-pagina="${p}">${p}</button></li>`;
  }
  html += `<li class="page-item ${paginaAtual === totalPaginas ? "disabled" : ""}">
      <button type="button" class="page-link" data-pagina="${paginaAtual + 1}" aria-label="Próxima"><i class="bi bi-chevron-right"></i></button></li>`;
  paginacao.innerHTML = html;
}

function renderizarResumo(totais) {
  document.querySelector("#kpiReceitas").textContent = formatarMoeda(totais.receitas);
  document.querySelector("#kpiDespesas").textContent = formatarMoeda(totais.despesas);
  document.querySelector("#kpiReceitasInfo").innerHTML =
    `<i class="bi bi-arrow-down-left me-1"></i> ${totais.qtdReceitas === 1 ? "1 entrada" : `${totais.qtdReceitas} entradas`} no filtro`;
  document.querySelector("#kpiDespesasInfo").innerHTML =
    `<i class="bi bi-arrow-up-right me-1"></i> ${totais.qtdDespesas === 1 ? "1 saída" : `${totais.qtdDespesas} saídas`} no filtro`;

  const saldo = document.querySelector("#kpiSaldo");
  saldo.textContent = formatarMoeda(totais.saldo);
  saldo.classList.toggle("text-primary", totais.saldo >= 0);
  saldo.classList.toggle("text-danger", totais.saldo < 0);

  const info = document.querySelector("#kpiSaldoInfo");
  if (!totais.qtdReceitas && !totais.qtdDespesas) info.innerHTML = '<i class="bi bi-dash-circle me-1"></i> Sem movimentações no filtro';
  else if (totais.saldo >= 0) info.innerHTML = '<i class="bi bi-check-circle text-primary me-1"></i> Período superavitário';
  else info.innerHTML = '<i class="bi bi-exclamation-circle text-danger me-1"></i> Período deficitário';

  document.querySelector("#rodapeReceitas").textContent = formatarMoeda(totais.receitas);
  document.querySelector("#rodapeDespesas").textContent = formatarMoeda(totais.despesas);
  const rodapeSaldo = document.querySelector("#rodapeSaldo");
  rodapeSaldo.textContent = formatarMoeda(totais.saldo);
  rodapeSaldo.className = `valor ${totais.saldo >= 0 ? "valor-positivo" : "valor-negativo"}`;
}

function renderizarExtrato() {
  filtradas = aplicarFiltros();
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  paginaAtual = Math.min(paginaAtual, totalPaginas);

  const pagina = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  corpo.innerHTML = pagina.map(linhaTabela).join("");

  if (!dados.transacoes.length) {
    areaVazia.innerHTML = estadoVazio({
      icone: "bi-receipt",
      titulo: "Nenhuma movimentação cadastrada",
      texto: dados.categorias.length
        ? "Registre sua primeira receita ou despesa para começar a acompanhar o seu saldo."
        : 'Comece cadastrando suas <a href="cadastro.html">categorias</a> e depois registre suas receitas e despesas.',
      acao: '<button type="button" class="btn btn-primary" data-nova-movimentacao><i class="bi bi-plus-lg"></i> Nova Movimentação</button>',
    });
  } else if (!filtradas.length) {
    areaVazia.innerHTML = estadoVazio({
      icone: "bi-funnel",
      titulo: "Nenhuma movimentação neste filtro",
      texto: "Tente outro período, tipo ou categoria.",
    });
  } else {
    areaVazia.innerHTML = "";
  }

  document.querySelector("#infoPaginacao").textContent = filtradas.length
    ? `Página ${paginaAtual} de ${totalPaginas} (${filtradas.length} ${filtradas.length === 1 ? "registro" : "registros"})`
    : "";
  renderizarPaginacao(totalPaginas);
  renderizarResumo(calcularTotais(filtradas));
}

function renderizarTudo() {
  preencherFiltros();
  renderizarExtrato();
  atualizarLayout(dados);
}

// ---------- Modal de cadastro / edição (US07) ----------

// O select de categorias mostra só as do tipo escolhido (Receita ou Despesa)
function preencherCategoriasDoForm(selecionada = campoCategoria.value) {
  const tipo = form.querySelector("[name=tipo]:checked").value;
  const opcoes = dados.categorias.filter((c) => c.tipo === tipo).sort((a, b) => a.nome.localeCompare(b.nome));

  campoCategoria.innerHTML =
    '<option value="">Selecione uma categoria</option>' +
    opcoes.map((c) => `<option value="${c.id}">${escaparHtml(c.nome)}</option>`).join("");
  campoCategoria.value = opcoes.some((c) => String(c.id) === String(selecionada)) ? selecionada : "";
  campoCategoria.disabled = !opcoes.length;
  document.querySelector("#semCategorias").classList.toggle("d-none", opcoes.length > 0);
}

form.querySelectorAll("[name=tipo]").forEach((radio) => radio.addEventListener("change", () => preencherCategoriasDoForm()));

function abrirModal(transacao = null) {
  idEmEdicao = transacao ? transacao.id : null;
  form.reset();
  limparValidacao(form);
  comprovante.limpar();

  document.querySelector("#tituloMovimentacao").textContent = transacao ? "Editar Movimentação" : "Nova Movimentação Financeira";

  if (transacao) {
    form.querySelector(`[name=tipo][value=${transacao.tipo}]`).checked = true;
    campoValor.value = formatarNumero(transacao.valor);
    campoData.value = transacao.data;
    campoDescricao.value = transacao.descricao;
    campoConta.value = transacao.conta || "Conta corrente";
    preencherCategoriasDoForm(transacao.categoriaId);
    comprovante.mostrarExistente(transacao.comprovante);
  } else {
    campoData.value = hojeIso();
    preencherCategoriasDoForm("");
  }

  modal.show();
}

modalElemento.addEventListener("shown.bs.modal", () => campoValor.focus());
modalElemento.addEventListener("hidden.bs.modal", () => comprovante.limpar());

// Envia o arquivo para a coleção "comprovantes" e devolve só os dados leves
async function salvarArquivo(arquivo, transacaoId) {
  const salvo = await api.criar("comprovantes", {
    transacaoId,
    clienteId: dados.cliente.id,
    nome: arquivo.name,
    tipo: arquivo.type,
    tamanho: arquivo.size,
    conteudo: await lerArquivo(arquivo),
  });
  return { id: salvo.id, nome: salvo.nome, tipo: salvo.tipo, tamanho: salvo.tamanho };
}

async function excluirArquivo(id) {
  try {
    await api.excluir("comprovantes", id);
  } catch {
    // Se o arquivo já não existir, seguimos em frente
  }
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const valor = converterValor(campoValor.value);
  const descricao = campoDescricao.value.trim().replace(/\s+/g, " ");
  const categoria = buscarCategoria(campoCategoria.value);

  const valido = validarCampos([
    { campo: campoValor, valido: valor > 0, mensagem: "Informe um valor maior que zero." },
    { campo: campoData, valido: REGEX.data.test(campoData.value), mensagem: "Informe a data da movimentação." },
    { campo: campoDescricao, valido: descricao.length >= 3, mensagem: "Descreva a movimentação (mínimo de 3 caracteres)." },
    { campo: campoCategoria, valido: Boolean(categoria), mensagem: "Escolha uma categoria." },
  ]);
  if (!valido) return;

  const movimentacao = {
    tipo: form.querySelector("[name=tipo]:checked").value,
    valor,
    data: campoData.value,
    descricao,
    categoriaId: categoria.id,
    conta: campoConta.value,
  };
  const { arquivoNovo, removido } = comprovante.obter();
  const botao = document.querySelector("#salvarMovimentacao");
  botaoCarregando(botao, true);

  try {
    if (idEmEdicao) {
      const anterior = buscarTransacao(idEmEdicao);
      if ((arquivoNovo || removido) && anterior.comprovante) {
        await excluirArquivo(anterior.comprovante.id);
        movimentacao.comprovante = null;
      }
      if (arquivoNovo) movimentacao.comprovante = await salvarArquivo(arquivoNovo, idEmEdicao);
      await api.atualizar("transacoes", idEmEdicao, movimentacao);
      mostrarAviso("Movimentação atualizada.");
    } else {
      const criada = await api.criar("transacoes", {
        ...movimentacao,
        clienteId: dados.cliente.id,
        comprovante: null,
        criadoEm: new Date().toISOString(),
      });
      if (arquivoNovo) {
        await api.atualizar("transacoes", criada.id, { comprovante: await salvarArquivo(arquivoNovo, criada.id) });
      }
      mostrarAviso(`${movimentacao.tipo === "RECEITA" ? "Receita" : "Despesa"} de ${formatarMoeda(valor)} registrada.`);
    }

    modal.hide();
    await recarregarTransacoes();
    renderizarTudo();
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Exclusão (US09) ----------

function pedirExclusao(transacao) {
  idParaExcluir = transacao.id;
  document.querySelector("#textoExcluir").innerHTML =
    `<strong>${escaparHtml(transacao.descricao)}</strong> (${formatarComSinal(transacao.valor, transacao.tipo)}) será removida do extrato e o saldo será recalculado. Essa ação não pode ser desfeita.`;
  modalExcluir.show();
}

document.querySelector("#confirmarExcluir").addEventListener("click", async (evento) => {
  const botao = evento.currentTarget;
  botaoCarregando(botao, true, "Excluindo...");
  try {
    // O JSON Server apaga junto o comprovante (ele tem "transacaoId")
    await api.excluir("transacoes", idParaExcluir);
    modalExcluir.hide();
    mostrarAviso("Movimentação excluída.");
    await recarregarTransacoes();
    renderizarTudo();
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Exportar CSV ----------

function celulaCsv(texto) {
  const valor = String(texto ?? "");
  return /[;"\n]/.test(valor) ? `"${valor.replaceAll('"', '""')}"` : valor;
}

document.querySelector("#exportarCsv").addEventListener("click", () => {
  const lista = aplicarFiltros();
  if (!lista.length) {
    mostrarAviso("Não há movimentações no filtro atual para exportar.", "info");
    return;
  }

  const linhas = [
    "data;descricao;valor;tipo;categoria;conta",
    ...lista.map((t) =>
      [
        formatarData(t.data),
        t.descricao,
        `${t.tipo === "DESPESA" ? "-" : ""}${formatarNumero(t.valor)}`,
        t.tipo === "RECEITA" ? "Receita" : "Despesa",
        buscarCategoria(t.categoriaId)?.nome || "",
        t.conta || "",
      ]
        .map(celulaCsv)
        .join(";")
    ),
  ];

  // "﻿" (BOM) faz o Excel reconhecer os acentos
  const arquivo = new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = `sobrouquanto-extrato-${hojeIso()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

// ---------- Importar CSV (US08) ----------

function separarColunas(linha, separador) {
  const colunas = [];
  let atual = "";
  let entreAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"' && entreAspas && linha[i + 1] === '"') {
      atual += '"';
      i++;
    } else if (c === '"') {
      entreAspas = !entreAspas;
    } else if (c === separador && !entreAspas) {
      colunas.push(atual.trim());
      atual = "";
    } else {
      atual += c;
    }
  }
  colunas.push(atual.trim());
  return colunas;
}

// "05/10/2026" ou "2026-10-05" → "2026-10-05" (ou null se a data não existir)
function converterData(texto) {
  let ano, mes, dia;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) [dia, mes, ano] = texto.split("/").map(Number);
  else if (REGEX.data.test(texto)) [ano, mes, dia] = texto.split("-").map(Number);
  else return null;
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function interpretarCsv(texto) {
  const linhas = texto.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!linhas.length) return [];
  const separador = linhas[0].includes(";") ? ";" : ",";
  const cabecalho = normalizar(linhas[0]);
  const inicio = cabecalho.includes("data") && cabecalho.includes("valor") ? 1 : 0;

  return linhas.slice(inicio).map((linha, i) => {
    const numero = i + inicio + 1;
    const [dataTexto = "", descricao = "", valorTexto = "", tipoTexto = "", categoriaTexto = "", conta = ""] = separarColunas(linha, separador);

    const data = converterData(dataTexto);
    const negativo = valorTexto.trim().startsWith("-");
    const valor = converterValor(valorTexto.replace("-", "").replace("+", ""));
    const tipoNormalizado = normalizar(tipoTexto);
    const tipo = tipoNormalizado.startsWith("rec") ? "RECEITA" : tipoNormalizado.startsWith("desp") ? "DESPESA" : negativo ? "DESPESA" : "RECEITA";
    const categoria = dados.categorias.find((c) => c.tipo === tipo && normalizar(c.nome) === normalizar(categoriaTexto));

    let erro = "";
    if (!data) erro = "data inválida";
    else if (!(valor > 0)) erro = "valor inválido";
    else if (descricao.trim().length < 3) erro = "descrição muito curta";

    return {
      numero,
      erro,
      movimentacao: { tipo, valor, data, descricao: descricao.trim(), categoriaId: categoria ? categoria.id : null, conta: conta || "Conta corrente" },
      categoriaTexto,
      categoria,
    };
  });
}

function renderizarPrevia() {
  const previa = document.querySelector("#previaCsv");
  const validas = linhasCsv.filter((l) => !l.erro);
  const invalidas = linhasCsv.filter((l) => l.erro);
  const botao = document.querySelector("#confirmarImportacao");

  botao.disabled = !validas.length;
  botao.innerHTML = `<i class="bi bi-check-lg"></i> Importar ${validas.length} ${validas.length === 1 ? "movimentação" : "movimentações"}`;

  if (!linhasCsv.length) {
    previa.innerHTML = '<div class="alert alert-warning small mb-0">O arquivo está vazio.</div>';
    return;
  }

  previa.innerHTML = `
    <div class="d-flex flex-wrap gap-3 small mb-2">
      <span class="text-primary fw-semibold"><i class="bi bi-check-circle"></i> ${validas.length} válidas</span>
      ${invalidas.length ? `<span class="text-danger fw-semibold"><i class="bi bi-x-circle"></i> ${invalidas.length} com erro (serão ignoradas)</span>` : ""}
    </div>
    <div class="table-responsive border rounded-3">
      <table class="table table-sm tabela-sq mb-0">
        <thead><tr><th>Linha</th><th>Data</th><th>Descrição</th><th>Categoria</th><th class="text-end">Valor</th></tr></thead>
        <tbody>
          ${linhasCsv
            .slice(0, 8)
            .map(
              (l) => `<tr class="${l.erro ? "table-danger" : ""}">
                <td class="mono">${l.numero}</td>
                <td class="data">${l.erro ? `<span class="text-danger">${l.erro}</span>` : formatarData(l.movimentacao.data)}</td>
                <td>${escaparHtml(l.movimentacao.descricao)}</td>
                <td>${l.categoria ? badgeCategoria(l.categoria) : `<span class="small text-body-secondary">${l.categoriaTexto ? `"${escaparHtml(l.categoriaTexto)}" não encontrada` : "Sem categoria"}</span>`}</td>
                <td class="valor text-end ${l.movimentacao.tipo === "RECEITA" ? "valor-positivo" : "valor-negativo"}">${l.erro ? "–" : formatarComSinal(l.movimentacao.valor, l.movimentacao.tipo)}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    ${linhasCsv.length > 8 ? `<small class="text-body-secondary">Mostrando 8 de ${linhasCsv.length} linhas.</small>` : ""}`;
}

document.querySelector("#arquivoCsv").addEventListener("change", async (evento) => {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;
  if (!/\.csv$/i.test(arquivo.name)) {
    linhasCsv = [];
    document.querySelector("#previaCsv").innerHTML = '<div class="alert alert-danger small mb-0">Escolha um arquivo com extensão .csv.</div>';
    document.querySelector("#confirmarImportacao").disabled = true;
    return;
  }
  linhasCsv = interpretarCsv(await arquivo.text());
  renderizarPrevia();
});

document.querySelector("#confirmarImportacao").addEventListener("click", async (evento) => {
  const botao = evento.currentTarget;
  const validas = linhasCsv.filter((l) => !l.erro);
  botao.disabled = true;

  try {
    // Uma requisição POST por linha, uma de cada vez (o JSON Server grava o arquivo a cada uma)
    for (const [i, linha] of validas.entries()) {
      botao.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Importando ${i + 1} de ${validas.length}...`;
      await api.criar("transacoes", {
        ...linha.movimentacao,
        clienteId: dados.cliente.id,
        comprovante: null,
        criadoEm: new Date().toISOString(),
      });
    }
    modalImportar.hide();
    mostrarAviso(`${validas.length} ${validas.length === 1 ? "movimentação importada" : "movimentações importadas"}.`);
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    await recarregarTransacoes().catch(() => {});
    filtroPeriodo.value = "todos"; // mostra tudo, já que o extrato pode ter outros meses
    renderizarTudo();
  }
});

modalImportarElemento.addEventListener("hidden.bs.modal", () => {
  linhasCsv = [];
  document.querySelector("#arquivoCsv").value = "";
  document.querySelector("#previaCsv").innerHTML = "";
  document.querySelector("#confirmarImportacao").disabled = true;
  document.querySelector("#confirmarImportacao").innerHTML = '<i class="bi bi-check-lg"></i> Importar';
});

// ---------- Eventos gerais ----------

document.addEventListener("click", async (evento) => {
  const novo = evento.target.closest("[data-nova-movimentacao]");
  const editar = evento.target.closest("[data-editar]");
  const excluir = evento.target.closest("[data-excluir]");
  const ver = evento.target.closest("[data-ver-comprovante]");
  const pagina = evento.target.closest("[data-pagina]");

  if (novo) abrirModal();
  if (editar) abrirModal(buscarTransacao(editar.dataset.editar));
  if (excluir) pedirExclusao(buscarTransacao(excluir.dataset.excluir));
  if (pagina && !pagina.closest(".disabled")) {
    paginaAtual = Number(pagina.dataset.pagina);
    renderizarExtrato();
  }
  if (ver) {
    try {
      const arquivo = await api.buscar("comprovantes", ver.dataset.verComprovante);
      abrirComprovante(arquivo.conteudo);
    } catch (erro) {
      mostrarAviso(erro.status === 404 ? "Comprovante não encontrado." : erro.message, "erro");
    }
  }
});

// Filtrar sem recarregar a página (US08)
formFiltros.addEventListener("input", () => {
  paginaAtual = 1;
  renderizarExtrato();
});
formFiltros.addEventListener("submit", (evento) => evento.preventDefault());
formFiltros.addEventListener("reset", () =>
  setTimeout(() => {
    paginaAtual = 1;
    renderizarExtrato();
  })
);

// ---------- Início ----------
try {
  dados = await iniciarPagina();
  renderizarTudo();
  if (location.hash === "#nova") abrirModal();
} catch {
  // O aviso de falha de conexão já foi exibido pelo main.js
}
