// Dentro de app/pages/<pagina>/ estamos 2 níveis abaixo da pasta app/
const APP = location.pathname.includes("/app/pages/") ? "../../" : "";

export const ROTAS = {
  inicio: `${APP}pages/dashboard/index.html`,
  login: `${APP}pages/login/index.html`,
  transacoes: `${APP}pages/transacoes/index.html`,
  categorias: `${APP}pages/categorias/index.html`,
  perfil: `${APP}pages/perfil/index.html`,
};
