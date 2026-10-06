// =============================================================
// paginas/dashboard.js — Painel geral (US03, US04 e US05)
// Todos os números são calculados a partir das movimentações do JSON Server.
// =============================================================

import { buscarCotacoes } from "../api.js";
import { calcularTotais, diasAte, hojeIso, mesAnterior, mesAtual, ordenarPorData, situacao, transacoesDoMes } from "../calculos.js";
import { iniciarPagina } from "../main.js";
import {
  badgeCategoria,
  escaparHtml,
  estadoVazio,
  formatarComSinal,
  formatarData,
  formatarMes,
  formatarMoeda,
  formatarPercentual,
} from "../render.js";

const QTD_RECENTES = 6;
const campoMes = document.querySelector("#mesReferencia");
const filtroRecentes = document.querySelector("#filtroRecentes");
let dados = { cliente: null, categorias: [], transacoes: [] };

const buscarCategoria = (id) => dados.categorias.find((c) => String(c.id) === String(id));
const plural = (n, singular, varios) => `${n} ${n === 1 ? singular : varios}`;

// ---------- US03: cards de saldo, receitas e despesas ----------

function diasConsiderados(anoMes) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const diasNoMes = new Date(ano, mes, 0).getDate();
  return anoMes === mesAtual() ? Number(hojeIso().slice(8, 10)) : diasNoMes;
}

function renderizarCards(anoMes) {
  const totais = calcularTotais(transacoesDoMes(dados.transacoes, anoMes));
  const anterior = calcularTotais(transacoesDoMes(dados.transacoes, mesAnterior(anoMes)));
  const semDados = !totais.qtdReceitas && !totais.qtdDespesas;

  // Saldo: Receitas - Despesas
  const saldo = document.querySelector("#kpiSaldo");
  saldo.textContent = formatarMoeda(totais.saldo);
  saldo.classList.toggle("text-danger", totais.saldo < 0);

  // Comparação com o mês anterior (só se o mês anterior tiver movimentações)
  const tendencia = document.querySelector("#kpiSaldoTendencia");
  if (!semDados && (anterior.qtdReceitas || anterior.qtdDespesas) && anterior.saldo !== 0) {
    const variacao = ((totais.saldo - anterior.saldo) / Math.abs(anterior.saldo)) * 100;
    const subiu = variacao >= 0;
    tendencia.className = `tendencia ${subiu ? "alta" : "baixa"} mt-2`;
    tendencia.innerHTML = `<i class="bi ${subiu ? "bi-graph-up-arrow" : "bi-graph-down-arrow"}"></i> ${subiu ? "+" : ""}${formatarPercentual(variacao)} vs mês anterior`;
  } else {
    tendencia.className = "tendencia mt-2 d-none";
  }

  // Saúde financeira: quanto da renda sobrou
  const saude = document.querySelector("#kpiSaude");
  const taxa = totais.receitas ? (totais.saldo / totais.receitas) * 100 : null;
  let rotulo = "Sem movimentações";
  let cor = "text-body-secondary";
  if (!semDados) {
    if (taxa === null || taxa < 0) [rotulo, cor] = ["Atenção", "text-danger"];
    else if (taxa >= 20) [rotulo, cor] = ["Excelente", "text-primary"];
    else [rotulo, cor] = ["Equilibrada", "text-primary"];
  }
  saude.innerHTML = `<i class="bi bi-circle-fill ${cor} me-1" style="font-size: 0.5rem"></i> Saúde Financeira: <strong class="${cor}">${rotulo}</strong>`;

  // Saldo acumulado de todas as movimentações até o fim do mês escolhido
  const acumulado = calcularTotais(dados.transacoes.filter((t) => t.data.slice(0, 7) <= anoMes)).saldo;
  document.querySelector("#kpiAcumulado").textContent = `Acumulado: ${formatarMoeda(acumulado)}`;

  // Receitas
  document.querySelector("#kpiReceitas").textContent = formatarMoeda(totais.receitas);
  document.querySelector("#kpiReceitasQtd").innerHTML =
    `<i class="bi bi-check-circle text-primary me-1"></i> ${plural(totais.qtdReceitas, "entrada registrada", "entradas registradas")}`;
  const metaReceitas = dados.categorias.filter((c) => c.tipo === "RECEITA").reduce((s, c) => s + c.limite, 0);
  document.querySelector("#kpiReceitasSub").textContent = metaReceitas
    ? `Meta das categorias: ${formatarMoeda(metaReceitas)}`
    : "Recebimentos do mês";
  document.querySelector("#kpiReceitasMeta").textContent = metaReceitas
    ? `${formatarPercentual((totais.receitas / metaReceitas) * 100, 0)} da meta`
    : "";

  // Despesas
  document.querySelector("#kpiDespesas").textContent = formatarMoeda(totais.despesas);
  const teto = dados.categorias.filter((c) => c.tipo === "DESPESA").reduce((s, c) => s + c.limite, 0);
  document.querySelector("#kpiDespesasSub").textContent = teto
    ? `${formatarPercentual((totais.despesas / teto) * 100)} do teto mensal orçado (${formatarMoeda(teto)})`
    : "Defina limites nas categorias para acompanhar o teto";
  document.querySelector("#kpiDespesasQtd").innerHTML =
    `<i class="bi bi-receipt-cutoff text-danger me-1"></i> ${plural(totais.qtdDespesas, "saída no mês", "saídas no mês")}`;
  document.querySelector("#kpiDespesasMedia").textContent =
    `Média: ${formatarMoeda(totais.despesas / diasConsiderados(anoMes))}/dia`;

  return { totais, taxa, semDados };
}

// ---------- US04: gráfico de rosca (CSS conic-gradient) ----------

function renderizarGrafico(anoMes, { totais, taxa, semDados }) {
  const fluxo = totais.receitas + totais.despesas;
  const pctReceitas = fluxo ? (totais.receitas / fluxo) * 100 : 0;
  const rosca = document.querySelector("#rosca");

  document.querySelector("#mesGrafico").textContent = formatarMes(anoMes);
  rosca.classList.toggle("vazia", semDados);
  rosca.style.setProperty("--receitas", `${pctReceitas}%`);
  rosca.setAttribute(
    "aria-label",
    semDados ? "Sem movimentações no mês" : `Receitas ${Math.round(pctReceitas)}%, despesas ${Math.round(100 - pctReceitas)}%`
  );

  document.querySelector("#roscaPercentual").textContent = semDados || taxa === null ? "–" : formatarPercentual(taxa);
  document.querySelector("#roscaEstado").textContent = semDados
    ? "Sem dados"
    : totais.saldo > 0
      ? "Superávit"
      : totais.saldo < 0
        ? "Déficit"
        : "Equilíbrio";

  document.querySelector("#legendaReceitas").textContent = formatarMoeda(totais.receitas);
  document.querySelector("#legendaDespesas").textContent = formatarMoeda(totais.despesas);
  document.querySelector("#legendaReceitasPct").textContent = `${formatarPercentual(pctReceitas, 0)} do fluxo`;
  document.querySelector("#legendaDespesasPct").textContent = `${formatarPercentual(fluxo ? 100 - pctReceitas : 0, 0)} do fluxo`;

  const economia = document.querySelector("#economiaLiquida");
  economia.textContent = `${totais.saldo >= 0 ? "+" : "-"} ${formatarMoeda(Math.abs(totais.saldo))}`;
  economia.classList.toggle("text-danger", totais.saldo < 0);

  // Mensagem de acordo com o resultado do mês
  const insight = document.querySelector("#insight");
  const texto = document.querySelector("#insightTexto");
  insight.classList.toggle("alerta-negativo", !semDados && totais.saldo < 0);

  if (semDados) {
    texto.innerHTML = dados.categorias.length
      ? `<strong class="text-primary">Tudo pronto!</strong> Registre receitas e despesas de ${formatarMes(anoMes).toLowerCase()} em <a href="pages/transacoes.html#nova">Transações</a> para ver o seu resumo aqui.`
      : '<strong class="text-primary">Comece por aqui:</strong> cadastre suas <a href="pages/cadastro.html">categorias</a> e depois registre suas movimentações.';
  } else if (totais.saldo < 0) {
    texto.innerHTML = `<strong class="text-danger">Atenção!</strong> As despesas passaram as receitas em ${formatarMoeda(Math.abs(totais.saldo))} neste mês. Revise as categorias com maior gasto.`;
  } else if (taxa === null) {
    texto.innerHTML = '<strong class="text-primary">Sem receitas no mês.</strong> Registre suas entradas para calcular quanto sobrou.';
  } else if (taxa >= 20) {
    texto.innerHTML = `<strong class="text-primary">Excelente ritmo!</strong> Você guardou ${formatarPercentual(taxa)} da sua renda neste mês.`;
  } else {
    texto.innerHTML = `<strong class="text-primary">No azul!</strong> Sobraram ${formatarPercentual(taxa)} da renda neste mês. Tente chegar a 20% para formar uma reserva.`;
  }
}

// ---------- Últimas movimentações ----------

function dataCurta(dataIso) {
  const dias = diasAte(dataIso);
  if (dias === 0) return "Hoje";
  if (dias === -1) return "Ontem";
  if (dias === 1) return "Amanhã";
  return formatarData(dataIso);
}

function renderizarRecentes() {
  const termo = filtroRecentes.value.trim().toLowerCase();
  const todas = ordenarPorData(dados.transacoes);
  const encontradas = todas.filter((t) => `${t.descricao} ${t.conta || ""}`.toLowerCase().includes(termo));
  const lista = encontradas.slice(0, QTD_RECENTES);

  document.querySelector("#corpoRecentes").innerHTML = lista
    .map((t) => {
      const categoria = buscarCategoria(t.categoriaId);
      const receita = t.tipo === "RECEITA";
      const agendada = situacao(t) !== "CONCLUIDA";
      return `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-3">
              <span class="icone-tile tile-sm ${categoria ? `tile-${categoria.cor}` : "tile-neutro"}"><i class="bi ${categoria ? categoria.icone : "bi-question-circle"}"></i></span>
              <div><span class="descricao">${escaparHtml(t.descricao)}</span><span class="detalhe">${receita ? "Receita" : "Despesa"}${t.comprovante ? ' • <i class="bi bi-paperclip"></i> comprovante' : ""}</span></div>
            </div>
          </td>
          <td class="data">${dataCurta(t.data)}</td>
          <td>${badgeCategoria(categoria)}</td>
          <td class="text-body-secondary"><i class="bi bi-wallet2 me-1"></i> ${escaparHtml(t.conta || "–")}</td>
          <td class="text-center">${
            agendada
              ? '<span class="badge-status agendada"><i class="bi bi-clock"></i> Agendada</span>'
              : '<span class="badge-status"><i class="bi bi-check-lg"></i> Concluída</span>'
          }</td>
          <td class="valor text-end ${receita ? "valor-positivo" : "valor-negativo"}">${formatarComSinal(t.valor, t.tipo)}</td>
        </tr>`;
    })
    .join("");

  const vazio = document.querySelector("#vazioRecentes");
  if (!todas.length) {
    vazio.innerHTML = estadoVazio({
      icone: "bi-receipt",
      titulo: "Nenhuma movimentação ainda",
      texto: "As movimentações que você cadastrar aparecem aqui.",
      acao: dados.categorias.length
        ? '<a class="btn btn-primary" href="pages/transacoes.html#nova"><i class="bi bi-plus-lg"></i> Nova Movimentação</a>'
        : '<a class="btn btn-primary" href="pages/cadastro.html"><i class="bi bi-tags"></i> Cadastrar categorias</a>',
    });
  } else if (!lista.length) {
    vazio.innerHTML = estadoVazio({ icone: "bi-search", titulo: "Nada encontrado", texto: "Nenhuma movimentação com esse texto." });
  } else {
    vazio.innerHTML = "";
  }

  document.querySelector("#infoRecentes").parentElement.classList.toggle("d-none", !todas.length);
  document.querySelector("#infoRecentes").textContent = todas.length
    ? `Mostrando ${lista.length} de ${plural(encontradas.length, "movimentação", "movimentações")}${termo ? " encontradas" : ""}`
    : "";
}

function renderizarMes() {
  const anoMes = campoMes.value || mesAtual();
  document.querySelector("#saudacao").textContent = `Visão geral de ${formatarMes(anoMes).replace(" /", "")}`;
  renderizarGrafico(anoMes, renderizarCards(anoMes));
}

// ---------- US05: cotações (AwesomeAPI) ----------

const ICONES_MOEDA = { USD: "bi-currency-dollar", EUR: "bi-currency-euro", GBP: "bi-currency-pound" };

function tempoDesde(milissegundos) {
  const minutos = Math.round((Date.now() - milissegundos) / 60000);
  if (minutos < 1) return "Atualizado agora";
  if (minutos < 60) return `Atualizado há ${minutos} min`;
  return `Atualizado às ${new Date(milissegundos).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

async function carregarCotacoes(forcar = false) {
  const lista = document.querySelector("#listaCotacoes");
  const status = document.querySelector("#statusCotacoes");
  const botao = document.querySelector("#atualizarCotacoes");
  botao.disabled = true;
  botao.querySelector("i").classList.add("girando");

  try {
    const { moedas, latencia } = await buscarCotacoes({ forcar });
    lista.innerHTML = moedas
      .map((m) => {
        const subiu = m.variacao >= 0;
        return `
          <div class="cotacao-item">
            <span class="moeda-icone"><i class="bi ${ICONES_MOEDA[m.codigo]}"></i></span>
            <div class="flex-grow-1">
              <span class="nome">${escaparHtml(m.nome)}</span><span class="par">${m.codigo}/BRL</span>
              <span class="atualizado">${tempoDesde(m.atualizadoEm)}</span>
            </div>
            <div class="text-end">
              <span class="preco d-block">${formatarMoeda(m.valor)}</span>
              <span class="tendencia ${subiu ? "alta" : "baixa"}">
                <i class="bi ${subiu ? "bi-arrow-up" : "bi-arrow-down"}"></i> ${subiu ? "+" : ""}${formatarPercentual(m.variacao, 2)}
              </span>
            </div>
          </div>`;
      })
      .join("");
    status.innerHTML = `<i class="bi bi-circle-fill text-primary" style="font-size: .45rem; vertical-align: middle"></i> Online${latencia ? ` • ${latencia}ms` : ""}`;
  } catch (erro) {
    lista.innerHTML = `
      <div class="alert alert-warning small mb-0 d-flex gap-2">
        <i class="bi bi-wifi-off"></i>
        <div>${escaparHtml(erro.message)} <button type="button" class="btn btn-link btn-sm p-0 align-baseline" data-tentar-cotacoes>Tentar de novo</button></div>
      </div>`;
    status.innerHTML = '<i class="bi bi-circle-fill text-danger" style="font-size: .45rem; vertical-align: middle"></i> Indisponível';
  } finally {
    botao.disabled = false;
    botao.querySelector("i").classList.remove("girando");
  }
}

document.querySelector("#atualizarCotacoes").addEventListener("click", () => carregarCotacoes(true));
document.addEventListener("click", (evento) => {
  if (evento.target.closest("[data-tentar-cotacoes]")) carregarCotacoes(true);
});

// ---------- Início ----------
campoMes.value = mesAtual();
campoMes.addEventListener("change", renderizarMes);
filtroRecentes.addEventListener("input", renderizarRecentes);
carregarCotacoes();

try {
  dados = await iniciarPagina();
  renderizarMes();
  renderizarRecentes();

  // Preferência "Cotações automáticas": atualiza a cada 5 minutos
  if (dados.cliente.preferencias?.cotacoesAuto !== false) {
    setInterval(() => carregarCotacoes(true), 5 * 60 * 1000);
  }
} catch {
  // O aviso de falha de conexão já foi exibido pelo main.js
}
