---
name: SobrouQuanto?
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-desktop: 1.5rem
  sidebar-width: 260px
  max-content-width: 1440px
---

## Brand & Style

O design system estabelece uma identidade visual contemporânea, segura e cristalina para gestão financeira pessoal desktop. O objetivo central é desmistificar o orçamento doméstico, transformando a ansiedade comum do encerramento de mês em uma sensação de controle, estabilidade e prosperidade palpável.

### Estilo Visual
- **Modern Corporate & Clean Precision:** Síntese equilibrada entre rigor corporativo bancário e a leveza de ferramentas SaaS modernas. 
- **Clareza de Dados (Data-Dense yet Airy):** Hierarquia visual rigorosa, permitindo leitura instantânea de saldos consolidados, fluxos de caixa e variações cambiais sem sobrecarga cognitiva.
- **Micro-interações Sofisticadas:** Estados sutis de foco e transições de hover em 150ms, sem sombras nem degradês: cards separados só pela borda.

## Colors

A paleta fundamenta-se na estabilidade institucional e na distinção funcional imediata de entradas, saídas e métricas de mercado. Os valores abaixo são exatamente os usados no código (`app/scss/_variables.scss`).

### Paleta principal

| Papel | Cor | Uso |
| --- | --- | --- |
| **Fundo** | `#f7f9fb` | Fundo de todas as páginas, destacando os cards brancos. |
| **Superfície** | `#ffffff` | Cards, modais, dropdowns e campos de formulário. |
| **Texto** | `#191c1e` | Títulos, valores e textos de leitura. |
| **Texto secundário** | `#3d4a42` | Legendas, rótulos e informações de apoio. |
| **Primária** | `#006948` | Botões principais, links, item ativo e saldos positivos. Representa saúde financeira e progresso. |
| **Borda** | `#bccac0` | Contorno de campos de formulário e botões secundários. |
| **Sucesso (receita)** | `#006948` | Receitas e saldo positivo. É a mesma cor da primária: o verde do app significa "dinheiro entrando". |
| **Erro (despesa)** | `#ba1a1a` | Despesas, limite estourado, exclusão e mensagens de erro. |
| **Aviso (cotação)** | `#825100` | Cotações de moedas e avisos neutros/pendentes. |

### Regra de uso

O código usa **só as 8 cores da paleta principal**, sempre pelas variáveis de `app/scss/_variables.scss`. Não há tons extras, transparências (`rgba`), degradês nem sombras. Quando um elemento precisa de um fundo diferente do card (ícones, chips, botões neutros, hover), ele usa a cor de **Fundo**.

As **cores das categorias** (laranja, vermelho, verde, azul, roxo, âmbar, rosa e ciano) não fazem parte da identidade: são escolhidas pelo usuário ao cadastrar uma categoria. Cada uma é escrita uma única vez, no fim de `app/scss/_componentes.scss`.

### Dos tokens ao código

As variáveis Sass do projeto ficam em `app/scss/_variables.scss` e são entregues ao Bootstrap em `app/scss/_bootstrap.scss`, **antes** do `@import` do framework (as variáveis do Bootstrap têm `!default`, então vale o valor definido antes):

| Token | Valor | Variável Sass do projeto | Variável do Bootstrap |
| --- | --- | --- | --- |
| Fundo | `#f7f9fb` | `$cor-fundo` | `$body-bg` |
| Superfície | `#ffffff` | `$cor-superficie` | padrão do `$card-bg` e `$dropdown-bg` (branco) |
| Texto | `#191c1e` | `$cor-texto` | `$body-color` |
| Texto secundário | `#3d4a42` | `$cor-texto-suave` | `$body-secondary-color` |
| Primária | `#006948` | `$cor-primaria` | `$primary` (o Bootstrap usa a primária também nos links e no foco dos campos) |
| Borda | `#bccac0` | `$cor-borda` | `$border-color` |
| Sucesso | `#006948` | `$cor-primaria` | `$success` |
| Erro | `#ba1a1a` | `$cor-erro` | `$danger` |
| Aviso | `#825100` | `$cor-aviso` | `$warning` |
| Fonte do texto | `Plus Jakarta Sans` | `$fonte-base` | `$font-family-sans-serif` |
| Fonte dos valores | `JetBrains Mono` | `$fonte-numerica` | `$font-family-monospace` |

## Typography

O pareamento tipográfico resolve dois propósitos distintos: legibilidade acolhedora em dados textuais e alinhamento milimétrico em dados quantitativos.

- **Plus Jakarta Sans:** Empregada em toda a interface de navegação, cabeçalhos, títulos de transação e formulários. Seu desenho geométrico moderno e terminação limpa estabelecem proximidade sem perder compostura executiva.
- **JetBrains Mono (Tabular Figures):** Obrigatória para valores monetários, taxas cambiais, percentuais e códigos de compensação bancária. O monospace tabular garante alinhamento vertical rigoroso de casas decimais e centavos em tabelas e cards analíticos, eliminando desalinhamento visual durante leituras comparativas.

## Layout & Spacing

O layout desktop de finanças adota uma estrutura em grade de 12 colunas com navegação lateral fixa, otimizada para monitores de 1080p a 4K.

### Regras Estruturais
- **Sidebar Fixa (260px):** Contém navegação macro, saldo consolidado imediato e seletor rápido de contas/carteiras.
- **Área de Conteúdo (Max 1440px):** Mantém legibilidade ótima de tabelas e gráficos sem dispersão excessiva em telas ultra-wide.
- **Régua de 8px:** Todo o padding e espaçamento interno é proporcional à grade de base 8 (8px, 16px, 24px, 32px, 48px), com passos de 4px reservados exclusivamente para microelementos (chips, badges, campos densos).
- **Adaptação Responsiva Desktop:**
  - **Desktop Amplo (> 1280px):** Grid de 12 colunas completo; cards de métricas organizados em 3 ou 4 colunas; visualização de tabela e gráfico lado a lado.
  - **Notebook Compacto (1024px - 1279px):** Sidebar recolhível em formato mini (72px com tooltips); cards de métricas em 2 colunas; tabelas com compressão de colunas não essenciais.

## Elevation & Depth

A profundidade é feita só com cor de fundo e borda, sem sombras:

1. **Nível 0 (página):** cor de Fundo (`#f7f9fb`).
2. **Nível 1 (cards, tabelas, dropdowns e modais):** cor de Superfície (`#ffffff`) com contorno `1px solid` na Borda (`#bccac0`). O modal usa o fundo escurecido padrão do Bootstrap.

## Shapes

Adota-se uma curvatura balanceada contemporânea de nível **2 (Rounded)**:

- **Contêineres e Cards Principais:** `rounded-xl` (1.5rem / 24px) para grandes blocos estruturais e modais; `rounded-lg` (1rem / 16px) para cards menores de KPI.
- **Controles e Elementos Interativos:** `rounded-lg` (0.75rem - 1rem / 12px - 16px) em botões, campos de busca, dropdowns e inputs.
- **Elementos de Status e Pílulas:** `rounded-full` (9999px) para badges de categoria, cotação cambial e tags de reconciliação.

## Components

### 1. Cards de Indicadores (KPIs)
- **Estrutura:** Superfície (`#ffffff`), Borda (`#bccac0`), raio `rounded-lg` (16px), padding `1.5rem`.
- **Conteúdo:** Rótulo em `caption-caps` na cor de Texto secundário (`#3d4a42`), valor financeiro consolidado em `label-numeric-lg` na cor de Texto (`#191c1e`).
- **Rodapé de Contexto:** Variação percentual com ícone direcional integrado: badge com fundo na cor de Fundo e texto Primária (`#006948`) para crescimento de receita, e fundo Fundo (`#f7f9fb`) com texto Erro (`#ba1a1a`) para aceleração de despesas.

### 2. Botões
- **Primário:** fundo Primária (`#006948`), texto branco (`#ffffff`), tipografia `Plus Jakarta Sans` peso 600, padding vertical `0.625rem`, horizontal `1.25rem`, `rounded-lg`. Hover: o Bootstrap escurece a Primária automaticamente. Foco visível com anel na cor Primária.
- **Secundário:** fundo Superfície (`#ffffff`), borda `1px solid` na Borda (`#bccac0`), texto na cor de Texto. Hover: fundo Fundo (`#f7f9fb`).
- **Ação Rápida Negativa / Estorno:** fundo Fundo (`#f7f9fb`) e texto Erro (`#ba1a1a`).

### 3. Badges de Categoria & Status Cambial
- **Categorias (Alimentação, Transporte, Lazer):** Estilo pílula (`rounded-full`), fundo Fundo (`#f7f9fb`), texto na cor de Texto, ícone monocromático de 14px à esquerda.
- **Status Cambial (Dólar, Euro):** Pílula contendo par de moedas, taxa em `label-numeric-sm`, e micro-seta de volatilidade (Primária subindo / Erro descendo / Aviso estável).

### 4. Tabela de Transações Financeiras
- **Linhas e Alternância:** Fundo base branco, destaque da linha no hover em Fundo (`#f7f9fb`).
- **Espaçamento e Tipografia:** Células com altura de 48px; descrições em `body-md` na cor de Texto; quantias sempre alinhadas à direita em `JetBrains Mono`.
- **Ações Contextuais:** Botões de edição/exclusão exibidos via opacidade 0 para 1 no hover da linha.

### 5. Campos de Entrada (Inputs)
- **Estrutura:** Altura de 44px, raio `rounded-lg`, fundo Superfície (`#ffffff`), borda `1px solid` na Borda (`#bccac0`).
- **Foco:** borda Primária (`#006948`) com o anel de foco padrão do Bootstrap (gerado a partir de `$primary`).
- **Input de Moeda:** Prefixo `R$` fixo na cor de Texto secundário (`#3d4a42`) com o valor digitado formatado instantaneamente via tipografia tabular.

### 6. Modais com Dropzone de Comprovantes
- **Modal:** Largura máxima de 560px, cabeçalho limpo com botão fechar na cor de Texto secundário (`#3d4a42`).
- **Área de Anexo (Dropzone):** Borda tracejada de `2px dashed` na Borda (`#bccac0`), fundo Fundo (`#f7f9fb`), canto `rounded-lg`. Enquanto um arquivo é arrastado por cima: borda Primária (`#006948`) e fundo na cor de Fundo. Ícone central de upload acompanhado de mensagem clara: *"Arraste PDF, PNG ou JPG até 10MB"*.