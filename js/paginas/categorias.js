// =============================================================
// paginas/categorias.js — Gestão de categorias (US06)
// GET, POST, PATCH e DELETE em /categorias
// =============================================================

import { api } from "../api.js";
import { calcularTotais, mesAtual, resumirCategorias, transacoesDoMes } from "../calculos.js";
import { atualizarLayout, iniciarPagina } from "../main.js";
import {
  botaoCarregando,
  escaparHtml,
  estadoVazio,
  formatarMes,
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
  mostrarAviso,
} from "../render.js";
import { aplicarMascaraValor, converterValor, limparAoDigitar, limparValidacao, validarCampos } from "../validacao.js";

// Estado da página
let dados = { cliente: null, categorias: [], transacoes: [] };
let idEmEdicao = null; // null = cadastrando uma nova
let idParaExcluir = null;

const grade = document.querySelector("#gradeCategorias");
const areaVazia = document.querySelector("#vazioCategorias");
const busca = document.querySelector("#buscaCategoria");
const form = document.querySelector("#formCategoria");
const modalElemento = document.querySelector("#modalNovaCategoria");
const modal = bootstrap.Modal.getOrCreateInstance(modalElemento);
const modalExcluir = bootstrap.Modal.getOrCreateInstance(document.querySelector("#modalExcluirCategoria"));
const campoNome = document.querySelector("#nomeCategoria");
const campoLimite = document.querySelector("#limiteCategoria");

aplicarMascaraValor(campoLimite);
limparAoDigitar(form);

// ---------- Desenho da página ----------

function renderizarVolume() {
  const mes = mesAtual();
  const totais = calcularTotais(transacoesDoMes(dados.transacoes, mes));
  const total = totais.receitas + totais.despesas;
  const pctDespesas = total ? (totais.despesas / total) * 100 : 0;
  const pctReceitas = total ? 100 - pctDespesas : 0;

  document.querySelector("#mesVolume").textContent = formatarMes(mes);
  document.querySelector("#totalVolume").textContent = formatarMoeda(total);

  const [barraDespesas, barraReceitas] = document.querySelectorAll("#barraVolume .progress");
  barraDespesas.style.width = `${pctDespesas}%`;
  barraDespesas.setAttribute("aria-valuenow", Math.round(pctDespesas));
  barraReceitas.style.width = `${pctReceitas}%`;
  barraReceitas.setAttribute("aria-valuenow", Math.round(pctReceitas));

  document.querySelector("#legendaDespesas").textContent = `${formatarMoeda(totais.despesas)} (${formatarPercentual(pctDespesas, 0)})`;
  document.querySelector("#legendaReceitas").textContent = `${formatarMoeda(totais.receitas)} (${formatarPercentual(pctReceitas, 0)})`;

  const status = document.querySelector("#statusOrcamento");
  if (!total) {
    status.className = "fw-semibold text-body-secondary";
    status.innerHTML = '<i class="bi bi-dash-circle me-1"></i> Sem movimentações no mês';
  } else if (totais.saldo >= 0) {
    status.className = "fw-semibold text-primary";
    status.innerHTML = '<i class="bi bi-check-circle me-1"></i> Equilibrado';
  } else {
    status.className = "fw-semibold text-danger";
    status.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i> Despesas acima das receitas';
  }
}

// Texto e cor da barra de progresso de acordo com o quanto do limite foi usado
function estadoDoLimite(categoria, percentual) {
  const pct = formatarPercentual(percentual, 0);
  if (categoria.tipo === "RECEITA") {
    return { texto: `${pct} recebido`, classeTexto: "text-primary", barra: `barra-${categoria.cor}` };
  }
  if (percentual >= 100) return { texto: "Limite excedido", classeTexto: "text-danger", barra: "barra-vermelho" };
  if (percentual >= 90) return { texto: `${pct} alerta`, classeTexto: "text-danger", barra: "barra-vermelho" };
  if (percentual >= 70) return { texto: `${pct} atingido`, classeTexto: `texto-${categoria.cor}`, barra: `barra-${categoria.cor}` };
  return { texto: `${pct} usado`, classeTexto: "text-primary", barra: `barra-${categoria.cor}` };
}

function cardCategoria({ categoria, valorMes, percentual, quantidade }) {
  const receita = categoria.tipo === "RECEITA";
  const estado = estadoDoLimite(categoria, percentual);
  const nome = escaparHtml(categoria.nome);

  return `
    <div class="col">
      <div class="card categoria-card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <span class="icone-tile tile-${categoria.cor}"><i class="bi ${categoria.icone}"></i></span>
            <span class="badge-tipo ${receita ? "receita" : "despesa"} mono">${receita ? "Receita" : "Despesa"}</span>
          </div>
          <div>
            <h2 class="nome">${nome}</h2>
            <span class="sub">${quantidade === 1 ? "1 transação associada" : `${quantidade} transações associadas`}</span>
          </div>
          <div>
            <span class="rotulo d-block">${receita ? "Recebido no Mês" : "Gasto no Mês"}</span>
            <span class="valor-lg d-block${receita ? " text-primary" : ""}">${formatarMoeda(valorMes)}</span>
          </div>
          <div class="mt-auto">
            <div class="limite mb-1">
              <span>${receita ? "Meta mensal" : "Limite"}: ${formatarMoeda(categoria.limite)}</span>
              <span class="${estado.classeTexto}">${estado.texto}</span>
            </div>
            <div class="progress" role="progressbar" aria-label="Uso do limite de ${nome}"
                 aria-valuenow="${Math.round(percentual)}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar ${estado.barra}" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button type="button" class="btn btn-link text-body-secondary" data-editar="${categoria.id}"><i class="bi bi-pencil"></i> Editar</button>
          <button type="button" class="btn btn-link text-danger" data-excluir="${categoria.id}"><i class="bi bi-trash3"></i> Excluir</button>
        </div>
      </div>
    </div>`;
}

function renderizarCategorias() {
  const filtroTipo = document.querySelector("[name=filtro]:checked").value;
  const termo = busca.value.trim().toLowerCase();

  // Contadores das pílulas
  const qtdDespesas = dados.categorias.filter((c) => c.tipo === "DESPESA").length;
  document.querySelector("#rotuloTodas").textContent = `Todas (${dados.categorias.length})`;
  document.querySelector("#rotuloDespesas").textContent = `Despesas (${qtdDespesas})`;
  document.querySelector("#rotuloReceitas").textContent = `Receitas (${dados.categorias.length - qtdDespesas})`;

  const resumo = resumirCategorias(dados.categorias, dados.transacoes, mesAtual())
    .filter(({ categoria }) => filtroTipo === "TODAS" || categoria.tipo === filtroTipo)
    .filter(({ categoria }) => categoria.nome.toLowerCase().includes(termo))
    .sort((a, b) => a.categoria.tipo.localeCompare(b.categoria.tipo) || a.categoria.nome.localeCompare(b.categoria.nome));

  grade.innerHTML = resumo.map(cardCategoria).join("");
  document.querySelector("#qtdExibidas").textContent = resumo.length === 1 ? "1 exibida" : `${resumo.length} exibidas`;

  // Estado vazio: sem nenhuma categoria ou sem resultado no filtro
  if (!dados.categorias.length) {
    areaVazia.innerHTML = estadoVazio({
      icone: "bi-tags",
      titulo: "Nenhuma categoria cadastrada",
      texto: "Crie categorias como Alimentação, Moradia ou Salário para organizar suas movimentações.",
      acao: '<button type="button" class="btn btn-primary" data-nova-categoria><i class="bi bi-plus-lg"></i> Criar primeira categoria</button>',
    });
  } else if (!resumo.length) {
    areaVazia.innerHTML = estadoVazio({
      icone: "bi-search",
      titulo: "Nenhuma categoria encontrada",
      texto: "Ajuste a busca ou o filtro de tipo.",
    });
  } else {
    areaVazia.innerHTML = "";
  }
}

function renderizarTudo() {
  renderizarVolume();
  renderizarCategorias();
  atualizarLayout(dados);
}

// ---------- Modal de cadastro / edição ----------

function abrirModal(categoria = null) {
  idEmEdicao = categoria ? categoria.id : null;
  form.reset();
  limparValidacao(form);

  document.querySelector("#modalNovaCategoriaLabel").textContent = categoria ? "Editar Categoria" : "Cadastrar Nova Categoria";

  if (categoria) {
    campoNome.value = categoria.nome;
    campoLimite.value = formatarNumero(categoria.limite);
    form.querySelector(`[name=tipoCategoria][value=${categoria.tipo}]`).checked = true;
    const cor = form.querySelector(`[name=cor][value="${categoria.cor}"]`);
    if (cor) cor.checked = true;
    const icone = form.querySelector(`[name=icone][value="${categoria.icone}"]`);
    if (icone) icone.checked = true;
  }

  modal.show();
}

modalElemento.addEventListener("shown.bs.modal", () => campoNome.focus());

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nome = campoNome.value.trim().replace(/\s+/g, " ");
  const tipo = form.querySelector("[name=tipoCategoria]:checked").value;
  const limite = converterValor(campoLimite.value);
  const cor = form.querySelector("[name=cor]:checked");
  const icone = form.querySelector("[name=icone]:checked");

  // Não pode haver duas categorias com o mesmo nome e tipo
  const repetida = dados.categorias.some(
    (c) => c.nome.toLowerCase() === nome.toLowerCase() && c.tipo === tipo && String(c.id) !== String(idEmEdicao)
  );

  const valido = validarCampos([
    { campo: campoNome, valido: nome.length >= 2, mensagem: "Informe o nome da categoria (mínimo de 2 letras)." },
    { campo: campoNome, valido: !repetida, mensagem: `Você já tem uma categoria de ${tipo === "RECEITA" ? "receita" : "despesa"} com esse nome.` },
    { campo: campoLimite, valido: limite > 0, mensagem: "Informe um valor maior que zero (ex.: 1.500,00)." },
    { campo: form.querySelector("[name=cor]"), valido: Boolean(cor), mensagem: "Escolha uma cor." },
    { campo: form.querySelector("[name=icone]"), valido: Boolean(icone), mensagem: "Escolha um ícone." },
  ]);
  if (!valido) return;

  const categoria = { nome, tipo, limite, cor: cor.value, icone: icone.value };
  const botao = document.querySelector("#salvarCategoria");
  botaoCarregando(botao, true);

  try {
    if (idEmEdicao) {
      const atualizada = await api.atualizar("categorias", idEmEdicao, categoria);
      dados.categorias = dados.categorias.map((c) => (String(c.id) === String(idEmEdicao) ? atualizada : c));

      // Se o tipo mudou, as movimentações dela passam a ter o mesmo tipo
      const vinculadas = dados.transacoes.filter((t) => String(t.categoriaId) === String(idEmEdicao) && t.tipo !== tipo);
      for (const t of vinculadas) {
        const nova = await api.atualizar("transacoes", t.id, { tipo });
        dados.transacoes = dados.transacoes.map((x) => (x.id === t.id ? nova : x));
      }
      mostrarAviso(`Categoria "${nome}" atualizada.`);
    } else {
      const criada = await api.criar("categorias", { ...categoria, clienteId: dados.cliente.id });
      dados.categorias.push(criada);
      mostrarAviso(`Categoria "${nome}" cadastrada.`);
    }
    modal.hide();
    renderizarTudo();
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Exclusão ----------

function pedirExclusao(categoria) {
  idParaExcluir = categoria.id;
  const qtd = dados.transacoes.filter((t) => String(t.categoriaId) === String(categoria.id)).length;
  document.querySelector("#modalExcluirCategoriaLabel").textContent = `Excluir a categoria "${categoria.nome}"?`;
  document.querySelector("#textoExcluirCategoria").textContent = qtd
    ? `${qtd === 1 ? "1 movimentação vinculada ficará" : `${qtd} movimentações vinculadas ficarão`} sem categoria (elas não são apagadas). Essa ação não pode ser desfeita.`
    : "Nenhuma movimentação usa esta categoria. Essa ação não pode ser desfeita.";
  modalExcluir.show();
}

document.querySelector("#confirmarExcluirCategoria").addEventListener("click", async (evento) => {
  const botao = evento.currentTarget;
  botaoCarregando(botao, true, "Excluindo...");

  try {
    // 1) Desvincula as movimentações. Importante: o JSON Server apaga em cascata
    //    os registros com "categoriaId" igual ao id excluído!
    const vinculadas = dados.transacoes.filter((t) => String(t.categoriaId) === String(idParaExcluir));
    for (const t of vinculadas) {
      const nova = await api.atualizar("transacoes", t.id, { categoriaId: null });
      dados.transacoes = dados.transacoes.map((x) => (x.id === t.id ? nova : x));
    }

    // 2) Exclui a categoria
    await api.excluir("categorias", idParaExcluir);
    dados.categorias = dados.categorias.filter((c) => String(c.id) !== String(idParaExcluir));

    modalExcluir.hide();
    mostrarAviso("Categoria excluída.");
    renderizarTudo();
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  } finally {
    botaoCarregando(botao, false);
  }
});

// ---------- Eventos ----------

// O botão "Nova Categoria" do cabeçalho e o do estado vazio
document.addEventListener("click", (evento) => {
  const botaoNovo = evento.target.closest("[data-nova-categoria]");
  const botaoEditar = evento.target.closest("[data-editar]");
  const botaoExcluir = evento.target.closest("[data-excluir]");
  const buscarCategoria = (id) => dados.categorias.find((c) => String(c.id) === String(id));

  if (botaoNovo) {
    abrirModal();
  } else if (botaoEditar) {
    abrirModal(buscarCategoria(botaoEditar.dataset.editar));
  } else if (botaoExcluir) {
    pedirExclusao(buscarCategoria(botaoExcluir.dataset.excluir));
  }
});

document.querySelectorAll("[name=filtro]").forEach((radio) => radio.addEventListener("change", renderizarCategorias));
busca.addEventListener("input", renderizarCategorias);

// ---------- Início ----------
try {
  dados = await iniciarPagina();
  renderizarTudo();
} catch {
  grade.innerHTML = "";
}
