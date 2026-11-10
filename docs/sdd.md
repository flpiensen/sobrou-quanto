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
- **Micro-interações Sofisticadas:** Estados sutis de foco, transições de hover em 150ms e micro-sombras difusas que reforçam tangibilidade sem ornamentação supérflua.

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
| **Destaque** | `#00855d` | Hover dos elementos na cor primária. |
| **Borda** | `#bccac0` | Contorno de campos de formulário e botões secundários. |
| **Sucesso (receita)** | `#006948` | Receitas e saldo positivo. É a mesma cor da primária: o verde do app significa "dinheiro entrando". |
| **Erro (despesa)** | `#ba1a1a` | Despesas, limite estourado, exclusão e mensagens de erro. |
| **Aviso (cotação)** | `#825100` | Cotações de moedas e avisos neutros/pendentes. |

### Tons de apoio

Versões claras da paleta principal, usadas só como fundo suave (nunca em texto):

| Papel | Cor | Uso |
| --- | --- | --- |
| Primária clara | `#85f8c4` | Fundo de ícones e chips de receita (com transparência). |
| Erro claro | `#ffdad6` | Fundo de ícones e avisos de despesa. |
| Superfície alternativa | `#f2f4f6` | Hover de linhas da tabela e botões neutros. |
| Borda suave | `#d7dfd9` | Contorno de cards e divisórias. |
| Contorno | `#6d7a72` | Placeholders, ícones neutros e botão de fechar. |

As **cores das categorias** (laranja, verde, azul, roxo etc.) não fazem parte da identidade: são escolhidas pelo usuário ao cadastrar uma categoria e ficam no mapa `$categorias`.

### Dos tokens ao código

As variáveis Sass do projeto ficam em `app/scss/_variables.scss` e são entregues ao Bootstrap em `app/scss/_bootstrap.scss`, **antes** do `@import` do framework (as variáveis do Bootstrap têm `!default`, então vale o valor definido antes):

| Token | Valor | Variável Sass do projeto | Variável do Bootstrap |
| --- | --- | --- | --- |
| Fundo | `#f7f9fb` | `$cor-fundo` | `$body-bg` |
| Superfície | `#ffffff` | `$cor-superficie` | padrão do `$card-bg` e `$dropdown-bg` (branco) |
| Texto | `#191c1e` | `$cor-texto` | `$body-color`, `$headings-color` |
| Texto secundário | `#3d4a42` | `$cor-texto-suave` | `$body-secondary-color` |
| Primária | `#006948` | `$cor-primaria` | `$primary`, `$link-color`, `$input-focus-border-color` |
| Destaque | `#00855d` | `$cor-primaria-destaque` | — (usada nas regras próprias de hover) |
| Borda | `#bccac0` | `$cor-borda` | `$input-border-color` |
| Borda suave | `#d7dfd9` | `$cor-borda-suave` | `$border-color`, `$card-border-color` |
| Sucesso | `#006948` | `$cor-receita` | `$success` |
| Erro | `#ba1a1a` | `$cor-despesa` | `$danger` |
| Aviso | `#825100` | `$cor-terciaria` | `$warning` |
| Fonte do texto | `Plus Jakarta Sans` | `$fonte-base` | `$font-family-sans-serif` |
| Fonte dos valores | `JetBrains Mono` | `$fonte-numerica` | `$font-family-monospace` |

O **Modo Escuro** reaproveita os mesmos papéis com variáveis CSS próprias (`--sq-fundo`, `--sq-texto`, `--sq-texto-suave` etc.), trocadas quando a página recebe `data-tema="escuro"`.

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

A profundidade é executada através de **Ambient Diffuse Layers** combinadas com **Low-Contrast Outlines**, transmitindo modernidade sem pesar visualmente o ambiente de dados.

### Níveis de Profundidade
1. **Level 0 (Base Canvas):** cor de Fundo (`#f7f9fb`), neutra e sem sombras.
2. **Level 1 (Cards Analíticos & Tabelas):** cor de Superfície (`#ffffff`), contorno externo nítido de `1px solid` na Borda suave (`#d7dfd9`) e sombra ambiental ultra-suave `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
3. **Level 2 (Dropdowns, Filtros Popover e Tooltips):** `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`, contorno `1px solid` na Borda (`#bccac0`).
4. **Level 3 (Modais de Cadastro e Drawer Lateral de Comprovantes):** `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`, acompanhado por backdrop scrim em `rgba(15, 23, 42, 0.45)` com leve desfoque (`backdrop-filter: blur(4px)`).

## Shapes

Adota-se uma curvatura balanceada contemporânea de nível **2 (Rounded)**:

- **Contêineres e Cards Principais:** `rounded-xl` (1.5rem / 24px) para grandes blocos estruturais e modais; `rounded-lg` (1rem / 16px) para cards menores de KPI.
- **Controles e Elementos Interativos:** `rounded-lg` (0.75rem - 1rem / 12px - 16px) em botões, campos de busca, dropdowns e inputs.
- **Elementos de Status e Pílulas:** `rounded-full` (9999px) para badges de categoria, cotação cambial e tags de reconciliação.

## Components

### 1. Cards de Indicadores (KPIs)
- **Estrutura:** Superfície (`#ffffff`), Borda suave (`#d7dfd9`), raio `rounded-lg` (16px), padding `1.5rem`.
- **Conteúdo:** Rótulo em `caption-caps` na cor de Texto secundário (`#3d4a42`), valor financeiro consolidado em `label-numeric-lg` na cor de Texto (`#191c1e`).
- **Rodapé de Contexto:** Variação percentual com ícone direcional integrado: badge com fundo Primária clara e texto Primária (`#006948`) para crescimento de receita, e fundo Erro claro (`#ffdad6`) com texto Erro (`#ba1a1a`) para aceleração de despesas.

### 2. Botões
- **Primário:** fundo Primária (`#006948`), texto branco (`#ffffff`), tipografia `Plus Jakarta Sans` peso 600, padding vertical `0.625rem`, horizontal `1.25rem`, `rounded-lg`. Hover: transição suave para o Destaque (`#00855d`). Foco visível com anel na cor Primária.
- **Secundário:** fundo Superfície (`#ffffff`), borda `1px solid` na Borda (`#bccac0`), texto na cor de Texto. Hover: fundo Superfície alternativa (`#f2f4f6`).
- **Ação Rápida Negativa / Estorno:** fundo Erro claro (`#ffdad6`) e texto Erro (`#ba1a1a`).

### 3. Badges de Categoria & Status Cambial
- **Categorias (Alimentação, Transporte, Lazer):** Estilo pílula (`rounded-full`), fundo Superfície alternativa (`#f2f4f6`), texto na cor de Texto, ícone monocromático de 14px à esquerda.
- **Status Cambial (Dólar, Euro):** Pílula contendo par de moedas, taxa em `label-numeric-sm`, e micro-seta de volatilidade (Primária subindo / Erro descendo / Aviso estável).

### 4. Tabela de Transações Financeiras
- **Linhas e Alternância:** Fundo base branco, destaque da linha no hover em Superfície alternativa (`#f2f4f6`).
- **Espaçamento e Tipografia:** Células com altura de 48px; descrições em `body-md` na cor de Texto; quantias sempre alinhadas à direita em `JetBrains Mono`.
- **Ações Contextuais:** Botões de edição/exclusão exibidos via opacidade 0 para 1 no hover da linha.

### 5. Campos de Entrada (Inputs)
- **Estrutura:** Altura de 44px, raio `rounded-lg`, fundo Superfície (`#ffffff`), borda `1px solid` na Borda (`#bccac0`).
- **Foco:** borda Primária (`#006948`) com anel de brilho suave `rgba(0, 105, 72, 0.15)`.
- **Input de Moeda:** Prefixo `R$` fixo na cor de Contorno (`#6d7a72`) com o valor digitado formatado instantaneamente via tipografia tabular.

### 6. Modais com Dropzone de Comprovantes
- **Modal:** Largura máxima de 560px, cabeçalho limpo com botão fechar na cor de Contorno (`#6d7a72`).
- **Área de Anexo (Dropzone):** Borda tracejada de `2px dashed` na Borda (`#bccac0`), fundo Superfície alternativa (`#f2f4f6`), canto `rounded-lg`. Enquanto um arquivo é arrastado por cima: borda Primária (`#006948`) e fundo Primária clara com transparência. Ícone central de upload acompanhado de mensagem clara: *"Arraste PDF, PNG ou JPG até 10MB"*.