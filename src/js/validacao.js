// =============================================================
// validacao.js — Validação de formulários com Expressões Regulares
// =============================================================

export const REGEX = {
  // algo@algo.dominio (sem espaços, com pelo menos 2 letras no final)
  email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,

  // Mínimo de 6 caracteres, com pelo menos uma letra e um número
  senha: /^(?=.*[A-Za-zÀ-ÿ])(?=.*\d).{6,}$/,

  // Nome e sobrenome: duas palavras ou mais, só letras
  nomeCompleto: /^[A-Za-zÀ-ÿ]{2,}(?:[ '-][A-Za-zÀ-ÿ]+)+$/,

  // Valor em reais: "1.234,56", "1234,56" ou "50"
  valor: /^(\d{1,3}(\.\d{3})*|\d+)(,\d{1,2})?$/,

  // Telefone: (11) 98765-4321 ou (11) 3456-7890
  telefone: /^\(\d{2}\) \d{4,5}-\d{4}$/,

  // Data no formato do input date: 2026-10-05
  data: /^\d{4}-\d{2}-\d{2}$/,
};

// "1.234,56" → 1234.56
export function converterValor(texto) {
  const limpo = String(texto).trim().replace(/\s|R\$/g, "");
  if (!REGEX.valor.test(limpo)) return NaN;
  return Number(limpo.replaceAll(".", "").replace(",", "."));
}

// Máscara monetária automática (US07): o usuário digita só números
// e o campo vai se formatando como dinheiro: 1 → 0,01 → 0,12 → 1,23 → 12,34
export function aplicarMascaraValor(input) {
  input.addEventListener("input", () => {
    const digitos = input.value.replace(/\D/g, "").slice(0, 11);
    if (!digitos) {
      input.value = "";
      return;
    }
    const numero = Number(digitos) / 100;
    input.value = numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });
}

// Máscara do telefone: 11987654321 → (11) 98765-4321
export function aplicarMascaraTelefone(input) {
  input.addEventListener("input", () => {
    const d = input.value.replace(/\D/g, "").slice(0, 11);
    let texto = d;
    if (d.length > 2) texto = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 6) {
      const meio = d.length === 11 ? 7 : 6;
      texto = `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
    }
    input.value = texto;
  });
}

// Marca um campo como inválido (classe .is-invalid do Bootstrap) e mostra a mensagem
export function marcarInvalido(campo, mensagem) {
  campo.classList.add("is-invalid");
  campo.setAttribute("aria-invalid", "true");

  // A mensagem fica depois do input-group (se houver) para não quebrar o layout
  const ancora = campo.closest(".input-group, .segmentado, .paleta-cores, .grade-icones") || campo;
  let feedback = ancora.nextElementSibling;
  if (!feedback || !feedback.classList.contains("feedback-campo")) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback d-block feedback-campo";
    ancora.after(feedback);
  }
  feedback.textContent = mensagem;
}

export function marcarValido(campo) {
  campo.classList.remove("is-invalid");
  campo.removeAttribute("aria-invalid");
  const ancora = campo.closest(".input-group, .segmentado, .paleta-cores, .grade-icones") || campo;
  const feedback = ancora.nextElementSibling;
  if (feedback && feedback.classList.contains("feedback-campo")) feedback.remove();
}

export function limparValidacao(formulario) {
  formulario.querySelectorAll(".is-invalid").forEach(marcarValido);
  formulario.querySelectorAll(".feedback-campo").forEach((el) => el.remove());
}

// Recebe uma lista de regras { campo, valido, mensagem } e marca cada campo.
// Devolve true se todas as regras passaram.
export function validarCampos(regras) {
  let tudoCerto = true;
  for (const { campo, valido, mensagem } of regras) {
    if (valido) {
      marcarValido(campo);
    } else {
      marcarInvalido(campo, mensagem);
      if (tudoCerto) campo.focus();
      tudoCerto = false;
    }
  }
  return tudoCerto;
}

// Ao digitar de novo num campo marcado como inválido, a marcação some
export function limparAoDigitar(formulario) {
  formulario.addEventListener("input", (evento) => {
    if (evento.target.classList.contains("is-invalid")) marcarValido(evento.target);
  });
}
