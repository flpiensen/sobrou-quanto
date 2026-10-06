// =============================================================
// api.js — Comunicação com as APIs (Fetch API + async/await)
//
// 1) JSON Server (API fake): guarda os dados no arquivo server/db.json.
//    Rode com: npm run api  →  http://localhost:3000
// 2) AwesomeAPI (API pública): cotações do Dólar, Euro e Libra.
// =============================================================

// Se a página estiver sendo servida pelo próprio JSON Server (porta 3000),
// usamos caminhos relativos. Caso contrário (ex.: Live Server na porta 5500),
// apontamos para o endereço completo do JSON Server.
const API_URL = location.port === "3000" ? "" : "http://localhost:3000";

const COTACOES_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL";

// Erro próprio, com uma mensagem amigável para exibir na tela
export class ErroApi extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

// Função base: todas as chamadas ao JSON Server passam por aqui
async function requisitar(caminho, opcoes = {}) {
  let resposta;

  try {
    resposta = await fetch(API_URL + caminho, {
      headers: { "Content-Type": "application/json" },
      ...opcoes,
    });
  } catch {
    // fetch só "estoura" quando nem chega ao servidor (servidor desligado, sem rede...)
    throw new ErroApi("Não foi possível conectar ao JSON Server. Verifique se ele está rodando com: npm run api");
  }

  if (!resposta.ok) {
    throw new ErroApi(`O JSON Server respondeu com erro ${resposta.status}.`, resposta.status);
  }

  return resposta.json();
}

// CRUD genérico: serve para "clientes", "categorias" e "transacoes"
export const api = {
  // GET /recurso?campo=valor
  listar(recurso, filtros = {}) {
    const parametros = new URLSearchParams(filtros).toString();
    return requisitar(`/${recurso}${parametros ? "?" + parametros : ""}`);
  },

  // GET /recurso/:id
  buscar(recurso, id) {
    return requisitar(`/${recurso}/${id}`);
  },

  // POST /recurso
  criar(recurso, dados) {
    return requisitar(`/${recurso}`, { method: "POST", body: JSON.stringify(dados) });
  },

  // PATCH /recurso/:id (altera só os campos enviados)
  atualizar(recurso, id, dados) {
    return requisitar(`/${recurso}/${id}`, { method: "PATCH", body: JSON.stringify(dados) });
  },

  // DELETE /recurso/:id
  excluir(recurso, id) {
    return requisitar(`/${recurso}/${id}`, { method: "DELETE" });
  },
};

// Carrega tudo o que pertence ao cliente logado, em paralelo
export async function carregarDadosDoCliente(clienteId) {
  const [cliente, categorias, transacoes] = await Promise.all([
    api.buscar("clientes", clienteId),
    api.listar("categorias", { clienteId }),
    api.listar("transacoes", { clienteId }),
  ]);
  return { cliente, categorias, transacoes };
}

// Mede se o JSON Server está no ar e quanto tempo ele leva para responder
export async function verificarJsonServer() {
  const inicio = performance.now();
  try {
    const resposta = await fetch(`${API_URL}/categorias?_limit=1`, { cache: "no-store" });
    return { online: resposta.ok, latencia: Math.round(performance.now() - inicio) };
  } catch {
    return { online: false, latencia: null };
  }
}

// ---------- AwesomeAPI ----------

const CHAVE_CACHE_COTACOES = "sq:cotacoes";
const VALIDADE_CACHE = 60 * 1000; // 1 minuto

// Busca USD, EUR e GBP. Guarda o resultado no sessionStorage por 1 minuto
// para não repetir a requisição a cada troca de página.
export async function buscarCotacoes({ forcar = false } = {}) {
  if (!forcar) {
    const cache = JSON.parse(sessionStorage.getItem(CHAVE_CACHE_COTACOES) || "null");
    if (cache && Date.now() - cache.salvoEm < VALIDADE_CACHE) return cache.dados;
  }

  // AbortController: cancela a requisição se a API demorar mais de 8 segundos
  const controle = new AbortController();
  const tempoLimite = setTimeout(() => controle.abort(), 8000);
  const inicio = performance.now();

  try {
    const resposta = await fetch(COTACOES_URL, { signal: controle.signal });
    if (!resposta.ok) throw new ErroApi(`A AwesomeAPI respondeu com erro ${resposta.status}.`, resposta.status);

    const json = await resposta.json();
    const dados = ["USD", "EUR", "GBP"]
      .map((codigo) => json[`${codigo}BRL`])
      .filter(Boolean)
      .map((moeda) => ({
        codigo: moeda.code,
        nome: moeda.name.split("/")[0],
        valor: Number(moeda.bid),
        variacao: Number(moeda.pctChange),
        atualizadoEm: Number(moeda.timestamp) * 1000,
      }));

    if (!dados.length) throw new ErroApi("A AwesomeAPI não retornou cotações.");

    const resultado = { moedas: dados, latencia: Math.round(performance.now() - inicio) };
    sessionStorage.setItem(CHAVE_CACHE_COTACOES, JSON.stringify({ salvoEm: Date.now(), dados: resultado }));
    return resultado;
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;
    if (erro.name === "AbortError") throw new ErroApi("A AwesomeAPI demorou demais para responder.");
    throw new ErroApi("Não foi possível consultar a AwesomeAPI. Verifique sua conexão com a internet.");
  } finally {
    clearTimeout(tempoLimite);
  }
}
