// =============================================================
// calculos.js — Regras de negócio: saldo, totais e limites
// Tudo é calculado a partir das movimentações cadastradas.
// =============================================================

// Data de hoje no formato do input date ("2026-10-05"), no fuso do usuário
export function hojeIso() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// "2026-10"
export function mesAtual() {
  return hojeIso().slice(0, 7);
}

// "2026-10" → "2026-09"
export function mesAnterior(anoMes) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const data = new Date(ano, mes - 2, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

// Quantidade de dias de diferença entre hoje e uma data (negativo = passado)
export function diasAte(dataIso) {
  const [a, m, d] = dataIso.split("-").map(Number);
  const [ha, hm, hd] = hojeIso().split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ha, hm - 1, hd)) / 86400000);
}

// Movimentações de um mês ("2026-10")
export function transacoesDoMes(transacoes, anoMes) {
  return transacoes.filter((t) => t.data.startsWith(anoMes));
}

// Receitas, despesas e saldo (Receitas - Despesas) de uma lista
export function calcularTotais(transacoes) {
  const totais = { receitas: 0, despesas: 0, qtdReceitas: 0, qtdDespesas: 0 };
  for (const t of transacoes) {
    if (t.tipo === "RECEITA") {
      totais.receitas += t.valor;
      totais.qtdReceitas++;
    } else {
      totais.despesas += t.valor;
      totais.qtdDespesas++;
    }
  }
  totais.saldo = totais.receitas - totais.despesas;
  return totais;
}

// Para cada categoria: quanto foi movimentado no mês e quanto do limite foi usado
export function resumirCategorias(categorias, transacoes, anoMes) {
  const doMes = transacoesDoMes(transacoes, anoMes);
  return categorias.map((categoria) => {
    const daCategoria = transacoes.filter((t) => String(t.categoriaId) === String(categoria.id));
    const valorMes = doMes
      .filter((t) => String(t.categoriaId) === String(categoria.id))
      .reduce((soma, t) => soma + t.valor, 0);
    const percentual = categoria.limite > 0 ? (valorMes / categoria.limite) * 100 : 0;
    return { categoria, valorMes, percentual, quantidade: daCategoria.length };
  });
}

// Ordena da mais recente para a mais antiga (data e, no empate, hora do cadastro)
export function ordenarPorData(transacoes) {
  return [...transacoes].sort(
    (a, b) => b.data.localeCompare(a.data) || (b.criadoEm || "").localeCompare(a.criadoEm || "")
  );
}

// Situação da movimentação: despesa com data futura ainda vai vencer
export function situacao(transacao) {
  if (transacao.data > hojeIso()) return transacao.tipo === "DESPESA" ? "AGENDADA" : "PREVISTA";
  return "CONCLUIDA";
}
