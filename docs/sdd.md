# Design System – SobrouQuanto?

Guia visual do SobrouQuanto?, um controle de finanças pessoais simples. Ele define as **8 cores**, as 2 fontes e os poucos padrões de forma que o app usa. Tudo o que está aqui existe no código, em `app/scss/_variables.scss`.

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

Cada cor vira **uma** variável Sass em `app/scss/_variables.scss`. Em `app/scss/_bootstrap.scss`, essas variáveis são entregues ao Bootstrap **antes** do `@import` dele (as variáveis do Bootstrap usam `!default`, então vale o valor que foi definido antes). O Bootstrap também fica limitado a essas cores: os mapas `$colors`, `$grays` e `$table-variants` estão vazios e `$theme-colors` tem só primary, success, warning e danger.

| Cor | Variável Sass do projeto | Variável do Bootstrap |
| --- | --- | --- |
| Fundo | `$cor-fundo` | `$body-bg`, `$body-secondary-bg`, `$body-tertiary-bg` |
| Superfície | `$cor-superficie` | `$card-bg`, `$modal-content-bg`, `$dropdown-bg`, `$offcanvas-bg-color`, `$table-bg` |
| Texto | `$cor-texto` | `$body-color`, `$body-emphasis-color` |
| Texto secundário | `$cor-texto-suave` | `$body-secondary-color` |
| Primária | `$cor-primaria` | `$primary` e `$success` |
| Borda | `$cor-borda` | `$border-color` e `$progress-bg` |
| Erro | `$cor-erro` | `$danger` |
| Aviso | `$cor-aviso` | `$warning` |

## Tipografia

| Fonte | Variável Sass | Variável do Bootstrap | Uso |
| --- | --- | --- | --- |
| Plus Jakarta Sans | `$fonte-base` | `$font-family-sans-serif` | Todo o texto da interface. |
| JetBrains Mono | `$fonte-numerica` | `$font-family-monospace` | Valores em R$, percentuais, datas e cotações. |

O tamanho base é 14px (`$font-size-base: 0.875rem`). O título da tela de login usa tipografia fluida com `clamp()`, de 32px no celular a 44px no desktop.

## Layout

- **Mobile first:** os estilos partem do celular e crescem com o mixin `a-partir-de()` e as classes de grid do Bootstrap (576, 768, 992 e 1200px).
- **Barra de navegação:** verde, fixa no topo (`sticky-top`). Abaixo de 992px, os links vão para um menu lateral (offcanvas) branco.
- **Conteúdo:** largura máxima de 1440px (`.limite-conteudo`), centralizado, com o grid de 12 colunas do Bootstrap.
- **Espaçamentos:** em `rem`, seguindo a escala do Bootstrap (0.25rem, 0.5rem, 1rem, 1.5rem, 3rem).

## Formas

- **Cantos:** `$border-radius: 0.5rem` (8px) em cards, botões, campos e menus.
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
