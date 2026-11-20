# Design System – SobrouQuanto?

Guia visual do SobrouQuanto?, um controle de finanças pessoais simples. Ele define as **8 cores**, as 2 fontes e os poucos padrões de forma que o app usa. Tudo o que está aqui existe no código, no início do `app/style.css`.

## Identidade visual

- **Verde da marca:** o logo (porquinho) e a barra de navegação usam a cor Primária, com textos e ícones brancos. O verde lembra "dinheiro sobrando".
- **Simples e limpo:** fundo claro, cards brancos separados só por uma borda. Sem sombras, sem degradês e sem transparências.
- **Valores fáceis de ler:** todo valor em R$ usa uma fonte de números alinhados, para os centavos ficarem em coluna.

## Cores

O projeto define **somente as 8 cores abaixo**. Não existem tons extras, versões claras ou escuras, nem cores de categoria: uma categoria de receita aparece em verde (Primária) e uma de despesa em vermelho (Erro). Os tons de hover e de alerta que o Bootstrap calcula sozinho a partir dessas cores não são variáveis do projeto.

### Paleta (as 8 cores)

| # | Papel | Cor | Onde aparece |
| --- | --- | --- | --- |
| 1 | **Fundo** | `#f7f9fb` | Fundo das páginas, dos campos de formulário e de ícones, chips e linhas em hover. |
| 2 | **Superfície** | `#ffffff` | Cards, modais, menus, tabelas e os textos da barra verde. |
| 3 | **Texto** | `#191c1e` | Títulos, valores e textos de leitura. |
| 4 | **Texto secundário** | `#3d4a42` | Legendas, rótulos e informações de apoio. |
| 5 | **Primária (sucesso)** | `#006948` | Logo, barra de navegação, botões, links, receitas e saldo positivo. |
| 6 | **Borda** | `#bccac0` | Contorno de cards, campos, tabelas e divisórias. |
| 7 | **Erro** | `#ba1a1a` | Despesas, limite estourado, exclusão e mensagens de erro. |
| 8 | **Aviso (destaque)** | `#825100` | Cotações de moedas, transações agendadas e limite perto do fim (70%). |

Sucesso não é uma 9ª cor: é a própria Primária. No app, o verde sempre significa "dinheiro entrando" ou "está tudo certo".

### Das cores para o código

Cada cor vira **uma** variável do CSS no `:root` do `app/style.css` e é usada com `var(--nome)` em todo o app. Logo abaixo, essas variáveis são entregues ao Bootstrap: ele já vem pronto (`bootstrap.min.css`) e lê as próprias variáveis (`--bs-...`), que recebem as nossas cores. Os tons que o Bootstrap usaria por conta própria (fundo e borda dos alertas, borda translúcida, foco dos campos) também apontam para essas 8 cores, e a sombra fica desligada (`--bs-box-shadow: none`).

| Cor | Variável do projeto | Variável do Bootstrap que recebe a cor |
| --- | --- | --- |
| Fundo | `--cor-fundo` | `--bs-body-bg`, `--bs-secondary-bg`, `--bs-tertiary-bg` |
| Superfície | `--cor-superficie` | `--bs-card-bg`, `--bs-modal-bg`, `--bs-dropdown-bg`, `--bs-offcanvas-bg`, `--bs-table-bg` |
| Texto | `--cor-texto` | `--bs-body-color`, `--bs-emphasis-color` |
| Texto secundário | `--cor-texto-suave` | `--bs-secondary-color` |
| Primária | `--cor-primaria` | `--bs-primary`, `--bs-success`, `--bs-link-color` e as variáveis do `.btn-primary` |
| Borda | `--cor-borda` | `--bs-border-color` e `--bs-progress-bg` |
| Erro | `--cor-erro` | `--bs-danger` e as variáveis do `.btn-danger` |
| Aviso | `--cor-aviso` | `--bs-warning` |

Algumas variáveis do Bootstrap pedem a cor em números R, G, B (as terminadas em `-rgb`, como `--bs-primary-rgb: 0, 105, 72`). É a mesma cor, só escrita de outro jeito, porque o Bootstrap monta o `rgba()` das classes `text-primary`, `bg-danger` etc. com elas.


## Tipografia

| Fonte | Variável do projeto | Variável do Bootstrap | Uso |
| --- | --- | --- | --- |
| Plus Jakarta Sans | `--fonte-base` | `--bs-body-font-family` | Todo o texto da interface. |
| JetBrains Mono | `--fonte-numerica` | `--bs-font-monospace` | Valores em R$, percentuais, datas e cotações. |

O tamanho base é 14px (`--bs-body-font-size: 0.875rem`). O título da tela de login usa tipografia fluida com `clamp()`, de 32px no celular a 44px no desktop.

## Layout

- **Mobile first:** os estilos partem do celular e crescem com media queries `@media (min-width: ...)` e as classes de grid do Bootstrap (576, 768, 992 e 1200px).
- **Barra de navegação:** verde, fixa no topo (`sticky-top`). Abaixo de 992px, os links vão para um menu lateral (offcanvas) branco.
- **Conteúdo:** largura máxima de 1440px (`.limite-conteudo`), centralizado, com o grid de 12 colunas do Bootstrap.
- **Espaçamentos:** em `rem`, seguindo a escala do Bootstrap (0.25rem, 0.5rem, 1rem, 1.5rem, 3rem).

## Formas

- **Cantos:** `--bs-border-radius: 0.5rem` (8px) em cards, botões, campos e menus.
- **Pílulas:** `border-radius: 9999px` em chips de status, badges de categoria e filtros.
- **Círculos:** avatar e pontos de status.
- **Profundidade:** sem sombras. Página na cor Fundo; cards e modais na cor Superfície com borda de 1px na cor Borda.

## Componentes

| Componente | Visual |
| --- | --- |
| Barra de navegação | Fundo Primária; logo em quadrado branco com porquinho verde; links e textos brancos; link ativo em pílula branca com texto verde. |
| Cards (KPI e listas) | Superfície, borda de 1px, cantos de 0.5rem. Rótulo em Texto secundário e valor em JetBrains Mono. |
| Botões | Primário: fundo Primária e texto branco. Neutro: fundo Superfície e borda. Excluir: Erro. |
| Badges de categoria | Pílula com fundo Fundo e ícone + nome em Primária (receita) ou Erro (despesa). |
| Tabela de transações | Fundo branco, linha em hover na cor Fundo, valores alinhados à direita em JetBrains Mono. |
| Campos de formulário | Fundo na cor Fundo, borda na cor Borda e foco na Primária (anel padrão do Bootstrap). |
| Barra de progresso | Trilho na cor Borda. Verde até 70% do limite, Aviso de 70% a 89% e Erro a partir de 90%. |
| Modais, dropdowns e toasts | Superfície com borda; os avisos (toasts) têm uma faixa lateral na cor do tipo de aviso. |
