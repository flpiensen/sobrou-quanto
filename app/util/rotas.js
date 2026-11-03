// =============================================================
// rotas.js — Endereço de cada página do SobrouQuanto?
//
// Todas as telas ficam em app/pages/<pagina>/index.html. Os caminhos
// são relativos, então funcionam no Live Server, no JSON Server
// (npm run api) e no GitHub Pages.
// =============================================================

// Dentro de app/pages/<pagina>/ estamos 2 níveis abaixo da pasta app/
const APP = location.pathname.includes("/app/pages/") ? "../../" : "";

export const ROTAS = {
  inicio: `${APP}pages/dashboard/index.html`,
  login: `${APP}pages/login/index.html`,
  transacoes: `${APP}pages/transacoes/index.html`,
  categorias: `${APP}pages/categorias/index.html`,
  perfil: `${APP}pages/perfil/index.html`,
};
