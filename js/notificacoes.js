// =============================================================
// notificacoes.js — Notificações do sininho
// Geradas a partir dos dados cadastrados (nada é fixo no HTML):
//  • despesas que vencem nos próximos 3 dias (US11: alertas de vencimento)
//  • categorias que passaram de 80% ou 100% do limite do mês
//  • metas de receita alcançadas
//  • mês com mais despesas do que receitas
//  • despesas do mês ainda sem comprovante
// =============================================================

import { calcularTotais, diasAte, mesAtual, resumirCategorias, situacao, transacoesDoMes } from "./calculos.js";
import { escaparHtml, formatarData, formatarMoeda, formatarPercentual } from "./render.js";

// Caminho até a raiz do site (as páginas internas ficam em /pages)
const RAIZ = location.pathname.includes("/pages/") ? "../" : "";
const LINK = {
  inicio: `${RAIZ}index.html`,
  transacoes: `${RAIZ}pages/transacoes.html`,
  categorias: `${RAIZ}pages/cadastro.html`,
  perfil: `${RAIZ}pages/perfil.html`,
};

export function gerarNotificacoes({ cliente, categorias, transacoes }) {
  const preferencias = { alertas: true, lembreteComprovante: true, ...cliente.preferencias };
  const mes = mesAtual();
  const nomeCategoria = (id) => categorias.find((c) => String(c.id) === String(id))?.nome || "Sem categoria";
  const lista = [];

  if (preferencias.alertas) {
    // 1) Vencimentos: despesas com data entre hoje e daqui a 3 dias
    transacoes
      .filter((t) => t.tipo === "DESPESA" && diasAte(t.data) >= 0 && diasAte(t.data) <= 3)
      .sort((a, b) => a.data.localeCompare(b.data))
      .forEach((t) => {
        const dias = diasAte(t.data);
        const quando = dias === 0 ? "vence hoje" : dias === 1 ? "vence amanhã" : `vence em ${dias} dias`;
        lista.push({
          id: `vencimento-${t.id}-${t.data}`,
          tile: "tile-despesa",
          icone: "bi-calendar-event",
          titulo: `${escaparHtml(t.descricao)} ${quando}`,
          texto: `${escaparHtml(nomeCategoria(t.categoriaId))} • <span class="mono">${formatarMoeda(t.valor)}</span>`,
          tempo: formatarData(t.data),
          link: LINK.transacoes,
        });
      });

    // 2) Limites das categorias de despesa e 3) metas de receita
    resumirCategorias(categorias, transacoes, mes).forEach(({ categoria, valorMes, percentual }) => {
      if (!categoria.limite) return;
      const valores = `<span class="mono">${formatarMoeda(valorMes)}</span> de <span class="mono">${formatarMoeda(categoria.limite)}</span>`;
      const nome = escaparHtml(categoria.nome);

      if (categoria.tipo === "DESPESA" && percentual >= 100) {
        lista.push({
          id: `limite100-${categoria.id}-${mes}`,
          tile: "tile-despesa",
          icone: "bi-exclamation-octagon",
          titulo: `${nome} ultrapassou o limite`,
          texto: `${valores} gastos neste mês`,
          tempo: "Neste mês",
          link: LINK.categorias,
        });
      } else if (categoria.tipo === "DESPESA" && percentual >= 80) {
        lista.push({
          id: `limite80-${categoria.id}-${mes}`,
          tile: "tile-ambar",
          icone: "bi-exclamation-triangle",
          titulo: `${nome} atingiu ${formatarPercentual(percentual, 0)} do limite`,
          texto: `${valores} gastos neste mês`,
          tempo: "Neste mês",
          link: LINK.categorias,
        });
      } else if (categoria.tipo === "RECEITA" && percentual >= 100) {
        lista.push({
          id: `meta-${categoria.id}-${mes}`,
          tile: "tile-receita",
          icone: "bi-trophy",
          titulo: `Meta de ${nome} alcançada`,
          texto: `${valores} recebidos neste mês`,
          tempo: "Neste mês",
          link: LINK.categorias,
        });
      }
    });

    // 4) Mês no vermelho
    const totais = calcularTotais(transacoesDoMes(transacoes, mes));
    if (totais.saldo < 0) {
      lista.push({
        id: `saldo-negativo-${mes}`,
        tile: "tile-despesa",
        icone: "bi-graph-down-arrow",
        titulo: "Despesas maiores que as receitas",
        texto: `Saldo do mês: <span class="mono">${formatarMoeda(totais.saldo)}</span>`,
        tempo: "Neste mês",
        link: LINK.inicio,
      });
    }
  }

  // 5) Despesas já realizadas no mês sem comprovante anexado
  if (preferencias.lembreteComprovante) {
    const semComprovante = transacoesDoMes(transacoes, mes).filter(
      (t) => t.tipo === "DESPESA" && !t.comprovante && situacao(t) === "CONCLUIDA"
    );
    if (semComprovante.length) {
      const n = semComprovante.length;
      lista.push({
        id: `comprovantes-${mes}-${n}`,
        tile: "tile-neutro",
        icone: "bi-paperclip",
        titulo: n === 1 ? "1 despesa sem comprovante" : `${n} despesas sem comprovante`,
        texto: `${escaparHtml(semComprovante[0].descricao)}${n > 1 ? " e outras" : ""} • anexe o recibo no extrato`,
        tempo: "Neste mês",
        link: LINK.transacoes,
      });
    }
  }

  return lista;
}

// ---------- Lidas / não lidas (localStorage, por cliente) ----------

const chaveLidas = (clienteId) => `sq:notificacoes-lidas:${clienteId}`;

function obterLidas(clienteId) {
  return JSON.parse(localStorage.getItem(chaveLidas(clienteId)) || "[]");
}

function salvarLidas(clienteId, ids) {
  localStorage.setItem(chaveLidas(clienteId), JSON.stringify([...new Set(ids)]));
}

// ---------- Desenho no DOM ----------

export function renderizarNotificacoes(lista, clienteId) {
  const lidas = obterLidas(clienteId);
  const naoLidas = lista.filter((n) => !lidas.includes(n.id));

  // Não lidas primeiro
  const ordenada = [...naoLidas, ...lista.filter((n) => lidas.includes(n.id))];

  const html = ordenada.length
    ? ordenada
        .map((n) => {
          const nova = !lidas.includes(n.id);
          return `
          <a class="item${nova ? " nao-lida" : ""}" href="${n.link}" data-notificacao="${n.id}">
            <span class="icone-tile tile-sm ${n.tile}"><i class="bi ${n.icone}"></i></span>
            <span class="flex-grow-1">
              <span class="titulo">${n.titulo}</span>
              <span class="texto">${n.texto}</span>
              <span class="tempo">${n.tempo}</span>
            </span>
            ${nova ? '<span class="marcador" aria-label="Não lida"></span>' : ""}
          </a>`;
        })
        .join("")
    : `<div class="notificacoes-vazio">
         <i class="bi bi-bell-slash"></i>
         <span>Nenhuma notificação por enquanto.</span>
         <small>Os alertas aparecem conforme você cadastra categorias e movimentações.</small>
       </div>`;

  document.querySelectorAll("[data-notificacoes]").forEach((area) => (area.innerHTML = html));

  document.querySelectorAll("[data-notificacoes-contador]").forEach((badge) => {
    badge.textContent = naoLidas.length === 1 ? "1 nova" : `${naoLidas.length} novas`;
    badge.classList.toggle("d-none", naoLidas.length === 0);
  });

  document.querySelectorAll(".btn-notificacao").forEach((botao) => {
    botao.classList.toggle("tem-novas", naoLidas.length > 0);
    botao.setAttribute("aria-label", naoLidas.length ? `Notificações (${naoLidas.length} novas)` : "Notificações");
  });

  document.querySelectorAll("[data-marcar-lidas]").forEach((botao) => {
    botao.disabled = naoLidas.length === 0;
    botao.onclick = () => {
      salvarLidas(clienteId, [...lidas, ...lista.map((n) => n.id)]);
      renderizarNotificacoes(lista, clienteId);
    };
  });

  // Clicar numa notificação também a marca como lida
  document.querySelectorAll("[data-notificacao]").forEach((item) => {
    item.addEventListener("click", () => salvarLidas(clienteId, [...obterLidas(clienteId), item.dataset.notificacao]));
  });
}
