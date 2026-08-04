# Wave Condominium — Design System

Fonte da verdade visual do produto, extraída da aplicação real (landing + app).
Serve para padronizar telas, criar componentes e montar o arquivo do Figma.

> **Tokens importáveis:** `docs/design-tokens.json` (formato Tokens Studio for Figma).
> No Figma: plugin **Tokens Studio** → *Import → File* → gera Variables/Styles
> de cores, tipografia, espaçamento, raios e sombras automaticamente.

---

## 1. Foundations

### Cores

**Marca (base da identidade — landing)**

| Token | Hex | Uso |
|---|---|---|
| brand/abyss | `#0A131C` | Navy mais escuro, fundos premium |
| brand/deep | `#101C29` | Navy escuro, início de gradiente/CTA |
| brand/navy | `#1A2A3A` | Títulos |
| brand/steel | `#3A6EA0` | Azul-aço, fim de gradiente, links |
| brand/blue | `#7AA8D0` | Azul primário (botão) |
| brand/chrome | `#C0CFE0` | Azul claro, bordas/detalhes |
| brand/teal | `#5DCAA5` | **Verde-água — acento/sucesso (assinatura)** |
| brand/light | `#F4F7FC` | Fundo claro |
| brand/ink | `#22303F` | Texto principal |
| brand/grey | `#5A6B7C` | Texto secundário |

**Wave (paleta do app)** — escala `50 → 900`: `#F0F4FF, #E8EEFF, #DDE3FF, #C0C8EE, #8A91C7, #4A5FC1, #3730A3, #2D3A8C, #1E2761, #131A47`.

**Semânticas**

| Papel | Valor |
|---|---|
| Primary | brand/steel `#3A6EA0` |
| Secondary | brand/blue `#7AA8D0` |
| Background | brand/light `#F4F7FC` |
| Surface | `#FFFFFF` |
| Text / Text secondary | brand/ink `#22303F` / brand/grey `#5A6B7C` |
| Border | `#E5E9F5` |
| Success | brand/teal `#5DCAA5` |
| Warning | `#EA580C` |
| Error | `#DC2626` |
| Info | brand/blue `#7AA8D0` |
| Disabled | `#B4B2A9` |

### Tipografia

- **Display (títulos):** Montserrat · **Body/UI:** Inter · **Números/dados:** IBM Plex Mono.

| Estilo | Fonte | Tamanho | Peso | Line-height | Obs. |
|---|---|---|---|---|---|
| H1 | Montserrat | 30 | 400 | 120% | Título de tela |
| H2 | Montserrat | 24 | 400 | 120% | Seção |
| H3 | Montserrat | 20 | 500 | 120% | Card |
| H4 | Montserrat | 18 | 500 | 150% | |
| Body | Inter | 16 | 400 | 165% | Padrão (≥16px por acessibilidade) |
| Body small | Inter | 14 | 400 | 150% | |
| Caption | Inter | 12 | 400 | 150% | |
| Button | Inter | 14 | 500 | 150% | |
| Label/eyebrow | IBM Plex Mono | 11 | 500 | 150% | UPPERCASE, tracking 0.18em, cor teal |
| Number | IBM Plex Mono | 20 | 500 | 120% | Valores/métricas (estilo ledger) |

### Espaçamento (base 4px)

`xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48`

### Border radius

`sharp 2 (landing) · md 8 · lg 12 (card padrão) · xl 16 (card grande) · full 9999 (pílula)`

### Sombras

- **sm:** `0 1 2 rgba(16,28,41,.06)` — hover leve
- **md:** `0 8 24 -8 rgba(16,28,41,.12)` — card
- **lg:** `0 24 60 -24 rgba(10,19,28,.35)` — destaque/premium

---

## 2. Componentes (inventário + variantes)

Criar como **Components + Variants + Auto Layout**, com as propriedades ligadas às
Variables/Styles dos tokens. Priorizar (existem no produto):

| Componente | Variantes principais |
|---|---|
| Button | primary, secondary, ghost · sizes sm/md · +ícone |
| Input / Textarea | default, focus, filled, error, disabled, read-only |
| Select / Dropdown | fechado, aberto, com valor, erro |
| Checkbox · Radio · Switch | on/off/indeterminado, disabled |
| Card | padrão (surface, radius lg, border, shadow md), métrica, com ação |
| Metric card | rótulo + número mono + acento teal (positivo) |
| Table | header, linha, zebra, hover, empty |
| Badge / Status | neutro, success (teal), warning, error, info |
| Alert / Toast | success, warning, error, info |
| Modal / Dialog | header + corpo + footer · backdrop com padding |
| Tabs | ativo/inativo · com contador |
| Sidebar | item default/ativo/hover · badge · perfil |
| Header (mobile) | logo + menu hambúrguer |
| Breadcrumb · Pagination · Tooltip · Avatar | estados básicos |
| Icons | Lucide (outline), 16–24px, acompanhados de texto quando não óbvios |

### Estados dos componentes

- **Button:** default · hover · pressed · focus (anel teal) · disabled · loading.
- **Input:** default · focus · filled · error · disabled · read-only.
- **Dados:** loading · skeleton · empty · error · success.

> Todo estado segue a identidade atual (cores/tipografia acima). Nunca deixar tela
> vazia sem explicação — usar Empty State com ícone + texto + CTA.

---

## 3. Telas (recriar as que existem)

Existem na aplicação (priorizar estas):

1. **Boas-Vindas** (landing) — referência visual principal
2. **Login**
3. **Dashboard (Visão Geral)** — já harmonizado ao padrão
4. **Painel da Administradora** (multi-condomínio)
5. **Comunicação** (Avisos) · **Reservas**
6. **Boletos** — já harmonizado
7. **Governança** — já harmonizado
8. **Tesouraria** · **Manutenção** · **Documentos** · **Unidades**
9. **Auditoria Stellar** · **Notificações** · **Perfil** · **Configurações** · **Reuniões**

> **Não existem ainda** (não inventar interface): Moradores/Apartamentos como telas
> separadas (moradores vivem em Unidades), Funcionários, Prestadores, Visitantes,
> Relatórios. Marcar como "a definir" na página Documentation.

---

## 4. Responsividade (Mobile First)

Breakpoints (Tailwind): **sm 640 · md 768 · lg 1024 · xl 1280**.

- **Mobile (<1024):** menu vira **drawer** (hambúrguer no header); cabeçalhos
  empilham (título em cima, ação embaixo); grids caem para 1 coluna; tabelas com
  scroll horizontal; padding `p-4`.
- **Tablet (768–1024):** grids 2 colunas; padding `p-6`.
- **Desktop (≥1024):** sidebar fixa; grids 3–4 colunas; padding `p-8`.

No Figma: usar **Auto Layout + Constraints**; criar frames representativos Mobile
(390), Tablet (834) e Desktop (1440) da mesma tela — não três imagens soltas.

---

## 5. UX (princípios do produto)

Interface limpa · navegação simples · poucas opções por tela · hierarquia visual
clara · botões e campos fáceis de localizar · poucos cliques · feedback imediato ·
redução de erros · textos objetivos. Não adicionar elementos só para "encher".

Hierarquia por tela: onde estou → objetivo da tela → informação principal → ação →
resultado. Usar título/eyebrow, cards, badges, separadores e espaçamento para
diferenciar pesos — nunca tudo com o mesmo peso.

---

## 6. Acessibilidade (WCAG 2.1)

- Contraste adequado (texto sobre fundo claro usa brand/ink ou navy).
- Texto base **≥16px**; áreas de toque **≥48×48px**.
- Estados de foco visíveis (anel teal); erro/sucesso/loading sempre tratados.
- Ícones acompanhados de texto quando a função não for óbvia.
- Considerar: idosos, baixa visão, pouca familiaridade tecnológica, uso noturno
  (áreas do porteiro com alto contraste e texto legível).

---

## 7. Estrutura sugerida do arquivo Figma

```
📁 Wave Condominium — Design System
├── 🎨 Foundations      (cores, tipografia, espaçamento, raios, sombras — via Tokens Studio)
├── 🧩 Components        (Buttons, Inputs, Cards, Badges, Modais, Sidebar, Header…)
├── 🔄 States            (estados de botões, inputs e dados)
├── 📐 Layouts           (grids, cabeçalhos, shell do dashboard)
├── 🖥️ Screens           (telas da seção 3, começando por Boas-Vindas e Login)
├── 📱 Responsive        (Mobile/Tablet/Desktop das telas principais)
└── 📚 Documentation     (regras de uso, breakpoints, UX, acessibilidade, telas "a definir")
```

**Ordem de montagem:** Foundations (importar tokens) → Components + States →
Layouts → Screens → Responsive → Documentation.

---

## 8. Inconsistências observadas (documentar, não alterar silenciosamente)

- A landing usa **cantos retos (2px)**; o app usa **cantos arredondados (12–16px)**.
  Decisão vigente do time: **harmonizar mantendo o arredondado** — a landing é a
  referência de cor/tipografia, não de raio. Registrar isso no Figma.
- Título de tela: app usa Montserrat (harmonizado); parte das telas antigas ainda
  usa Playfair serif em alguns pontos — padronizar para Montserrat ao migrar.
