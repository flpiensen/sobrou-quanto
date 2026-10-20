// =============================================================
// vite.config.js — Build do SobrouQuanto? (MPA: várias páginas HTML)
// Mesmo padrão do repositório modelo da disciplina (lab-framework-css).
// =============================================================
import { defineConfig } from "vite";
import { resolve } from "node:path";

const raiz = resolve(process.cwd());

/** Caminho do index.html de uma página em src/paginas/<nome>/. */
const pagina = (nome) => resolve(raiz, `src/paginas/${nome}/index.html`);

export default defineConfig({
  // Caminhos relativos: o site roda tanto em / (local) quanto em
  // /sobrou-quanto/ (GitHub Pages) sem precisar mudar nada.
  base: "./",

  // MPA: cada página é um index.html próprio.
  // Toda página nova precisa ser registrada aqui embaixo.
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(raiz, "index.html"),
        login: pagina("login"),
        transacoes: pagina("transacoes"),
        categorias: pagina("categorias"),
        perfil: pagina("perfil"),
      },
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // permite "bootstrap/scss/bootstrap" sem caminho relativo
        loadPaths: [resolve(raiz, "node_modules")],
        quietDeps: true,
        // o Bootstrap 5.3 ainda é carregado com @import (ver _bootstrap.scss)
        silenceDeprecations: ["import"],
      },
    },
  },

  server: {
    port: 5173,
    open: true,
    // o JSON Server grava no db.json a cada cadastro; não precisa recarregar a página
    watch: { ignored: ["**/server/**"] },
  },
});
