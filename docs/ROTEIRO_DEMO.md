# Roteiro do Vídeo Demo — Wave Condominium

**Duração alvo:** 5 a 7 minutos
**Ambiente:** produção — `https://wave-condominium.vercel.app`
**Senha de todas as contas de demonstração:** `Senha@12345`

| Perfil | E-mail |
|---|---|
| Síndico | `sindico@wave.com` |
| Morador | `morador@wave.com` |
| Administradora | `administradora@wave.com` |

---

## Antes de gravar (checklist)

- [ ] Abrir o site em uma janela anônima (evita sessão logada e cache).
- [ ] Deixar uma aba aberta no explorador da Stellar testnet: `https://stellar.expert/explorer/testnet` (para mostrar o hash ao vivo).
- [ ] Fechar notificações do sistema e abas pessoais.
- [ ] Testar áudio e definir zoom do navegador em ~100% (telas ficam legíveis).
- [ ] Ter os e-mails/senha à mão (ou usar os botões de demonstração na tela de login).
- [ ] Opcional: gravar em 1080p, cursor visível.

---

## Cena 0 — Abertura (30s)

**Tela:** página de login (`/login`).

**Narração:**
> "Este é o Wave Condominium — uma plataforma de gestão condominial com transparência auditável. Cada decisão, pagamento e documento fica registrado, com ancoragem na blockchain Stellar. Vou mostrar os quatro perfis do sistema e como tudo se conecta."

**Ação:** apontar rapidamente para os três atalhos de conta (Síndico, Morador, Administradora).

---

## Cena 1 — Perfis e controle de acesso (RBAC) (45s)

**Objetivo:** mostrar que o menu muda conforme o perfil.

**Ação:**
1. Entrar como **Morador** (`morador@wave.com`).
2. Mostrar o menu lateral enxuto (sem "Criar Conta", "Admin", "Configurações").
3. Sair e entrar como **Síndico** (`sindico@wave.com`).
4. Mostrar o menu com as opções de gestão que apareceram.

**Narração:**
> "As permissões são aplicadas no servidor, não só na interface. O morador nem enxerga as funções de gestão — elas não aparecem no menu, em vez de apenas ficarem desabilitadas."

---

## Cena 2 — Governança DAO (60s)

**Tela:** logado como **Síndico** → menu **Governança**.

**Ação:**
1. Mostrar a lista de propostas com os status (em votação, aprovada, em execução, concluída).
2. Abrir uma proposta em votação e registrar um voto.
3. Destacar as regras: **voto único por morador**, prazo de **30 dias**, e **apuração por maioria de todos os moradores** (não só de quem votou).
4. Mostrar a Fila de Prioridades / deliberações anteriores.

**Narração:**
> "As decisões viram propostas votáveis. Cada morador vota uma única vez, a votação encerra automaticamente no prazo, e o resultado considera a maioria de todos os moradores. Tudo é apurado no servidor — não dá para burlar pelo navegador."

---

## Cena 3 — Boletos + ancoragem na Stellar (75s) ⭐ ponto alto

**Tela:** logado como **Síndico** → menu **Boletos**.

**Ação:**
1. Mostrar as abas **Em Aberto** e **Histórico**.
2. Abrir um boleto → **Ver Detalhes** (linha digitável, composição da taxa, baixar PDF / imprimir).
3. Efetuar o pagamento (Pix/cartão) e mostrar a **compensação**.
4. Mostrar o **hash da transação Stellar** gerado no comprovante.
5. Copiar o hash → colar na aba do **stellar.expert (testnet)** → mostrar a transação registrada na blockchain, pública e verificável.

**Narração:**
> "Ao pagar, o Wave registra uma prova criptográfica na rede Stellar. Esse hash é público: qualquer morador consegue conferir o pagamento de forma independente, sem precisar confiar apenas no síndico. É a transparência de verdade."

> **Evidência a capturar:** salve o print/URL da transação no explorer — vai para o documento de evidências do SOW.

---

## Cena 4 — Comunicação e Reservas (45s)

**Tela:** menu **Comunicação**.

**Ação:**
1. Mostrar os avisos ordenados por prioridade (urgente no topo, com selo).
2. (Opcional) Criar um aviso rápido como síndico.
3. Ir para **Reservas**: abrir o calendário, solicitar uma reserva de espaço comum, mostrar aprovação/bloqueio de data.

**Narração:**
> "A comunicação é priorizada — o que é urgente aparece primeiro. E as áreas comuns têm reserva com calendário, aprovação do síndico e bloqueio de conflitos, tudo validado no servidor."

---

## Cena 5 — Painel da Administradora (multi-condomínio) (75s) ⭐ Entregável 2

**Tela:** sair e entrar como **Administradora** (`administradora@wave.com`).

**Ação:**
1. Cai direto no **Painel da Administradora**: métricas consolidadas (condomínios, moradores, boletos em aberto, propostas ativas) e um card por condomínio.
2. Clicar em **Gerenciar** em "Residencial Aurora".
3. Mostrar o **banner "Gerenciando Residencial Aurora"** no topo e que as telas (Boletos, Governança) agora mostram os dados daquele condomínio.
4. Clicar em **Trocar condomínio** → voltar ao painel → entrar em outro (ex.: "Parque das Flores") e mostrar que os dados mudam.

**Narração:**
> "Para administradoras que gerem vários condomínios, há um painel consolidado. Ela escolhe um condomínio, atua como gestora dele reutilizando todas as telas, e troca de condomínio a qualquer momento. Cada condomínio é totalmente isolado — uma administradora só acessa os que estão sob sua gestão, e isso é garantido no servidor."

---

## Cena 6 — Fechamento (30s)

**Tela:** voltar ao painel da administradora ou à visão geral.

**Narração:**
> "Por baixo, tudo roda sobre PostgreSQL com sessões seguras por perfil, isolamento multi-condomínio e provas na Stellar. É gestão condominial com transparência de verdade — auditável por qualquer morador. Obrigado."

---

## Ordem sugerida das cenas (resumo)

1. Abertura → 2. Perfis/RBAC → 3. Governança → 4. **Boletos + Stellar** → 5. Comunicação/Reservas → 6. **Painel Administradora** → 7. Fechamento.

> Se o vídeo precisar ser curto (3-4 min), priorize: **Boletos + Stellar** e **Painel da Administradora** — são os diferenciais mais fortes.

---

## Evidências a coletar durante a gravação (para o SOW)

- [ ] URL/print de pelo menos 1 transação de boleto no `stellar.expert` (testnet).
- [ ] Print do painel da administradora com os 3 condomínios.
- [ ] Print do menu diferente entre Morador e Síndico (prova do RBAC).
- [ ] Print de uma proposta encerrada com o resultado apurado.

---

## Dicas de gravação

- Fale o que vai fazer **antes** de clicar — dá tempo do espectador acompanhar.
- Pausas curtas entre cenas facilitam a edição depois.
- Se errar, não recomece tudo: pare, respire e refaça só a cena.
- Deixe o cursor "descansar" 1-2s sobre o elemento importante antes de clicar.
