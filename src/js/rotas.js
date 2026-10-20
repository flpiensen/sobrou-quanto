// =============================================================
// rotas.js — Endereço de cada página do SobrouQuanto?
//
// O Dashboard é o index.html da raiz; as demais páginas ficam em
// src/paginas/<pagina>/index.html. Os caminhos são relativos, então
// funcionam tanto no "npm run dev" quanto no GitHub Pages.
// =============================================================

// Páginas internas estão 3 níveis abaixo da raiz (src/paginas/<pagina>/)
export const RAIZ = location.pathname.includes("/src/paginas/") ? "../../../" : "";

export const ROTAS = {
  inicio: `${RAIZ}index.html`,
  login: `${RAIZ}src/paginas/login/index.html`,
  transacoes: `${RAIZ}src/paginas/transacoes/index.html`,
  categorias: `${RAIZ}src/paginas/categorias/index.html`,
  perfil: `${RAIZ}src/paginas/perfil/index.html`,
};
