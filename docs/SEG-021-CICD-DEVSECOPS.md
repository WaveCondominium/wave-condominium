# SEG-021 · Esteira CI/CD com gates de segurança (DevSecOps)

> Status: **PRONTO PARA REVISÃO** — gerado fora do repositório do usuário
> (sem acesso de push nesta sessão). Falta: copiar os arquivos, rodar os 3
> testes de validação, marcar os 4 checks como `required` no GitHub, e
> revisar as duas referências externas que não tenho contexto (seção 6).

## 1. O que já existia (antes deste card)
A esteira já tinha 3 das 4 etapas de segurança pedidas — este card **não
parte do zero**:
- **Lint, Typecheck, Build, Testes** — job `quality` (`Lint • Types • Test • Build`).
- **SCA** — job `dependency-scan` (SEG-013): `npm audit` com allowlist
  documentada (`security/audit-exceptions.json`), SBOM CycloneDX, bloqueia
  High/Critical.
- **Secret Scan** — job `secret-scan` (SEG-005): gitleaks.
- **Permissões mínimas** — o workflow já tinha `permissions: contents: read`
  no nível raiz (least privilege já aplicado).
- **Trigger seguro** — `pull_request` (não `pull_request_target`), então
  secrets do repositório nunca ficam expostos a código de um fork malicioso
  num PR — o vetor de ataque "pwn request" já não se aplica aqui.

## 2. O que faltava e foi implementado nesta entrega

### SAST — Semgrep (novo)
Novo job `sast` no `ci.yml`, mesmo padrão dos outros: roda em todo push/PR,
gera relatório completo (artifact) e bloqueia com um gate próprio.

- **Ferramenta:** Semgrep CLI (open-source, sem conta/token necessário para
  os rulesets públicos usados). Rulesets: `p/owasp-top-ten`, `p/javascript`,
  `p/typescript`, `p/react`, `p/nextjs` — cobrem SQL Injection, XSS,
  problemas de autenticação/autorização, uso inseguro de API e padrões de
  código vulneráveis, exatamente os itens mínimos do card.
- **Gate:** `scripts/security/sast-gate.mjs` — **mesma arquitetura do
  `audit-gate.mjs`** (SEG-013): lê o relatório JSON do Semgrep, bloqueia
  qualquer finding de severidade **ERROR** (equivalente ao High/Critical do
  card) que não esteja em `security/sast-exceptions.json`. WARNING/INFO só
  ficam no relatório (artifact), para acompanhamento — mesma política do
  card (Critical/High bloqueiam, Moderate/Low só registram).
- **Testado de verdade nesta sessão** (rodei o Semgrep real contra um
  relatório sintético, já que `semgrep.dev` não é alcançável do meu
  ambiente, mas é alcançável do GitHub Actions normalmente): confirmei que
  o gate bloqueia um ERROR sem exceção, aceita com exceção válida, e volta
  a bloquear quando a exceção vence — os 3 comportamentos node a node.
- **Comportamento fail-closed confirmado:** se o Semgrep não conseguir
  baixar os rulesets (rede fora, `semgrep.dev` indisponível), o próprio
  comando `semgrep scan` falha com código de saída ≠ 0 — o job trava
  **antes** de chegar no gate, nunca passa silenciosamente achando que não
  há findings.

### Ação pendente descoberta: checks obrigatórios incompletos
Conferindo o histórico de PRs desta sessão, **só 2 dos 3 checks já
existentes estavam marcados como `required`** em Settings → Branches
(`Lint • Types • Test • Build` e `Secret Scan`) — "Dependências (SCA)"
**nunca foi marcado**, apesar de já bloquear tecnicamente quando roda.
Isso significa que, na prática, um merge poderia (em teoria) ser forçado
sem esperar o SCA passar. **Corrigir isso é literalmente um critério de
aceite deste card** ("Status checks obrigatórios configurados", "Merge não
pode contornar os gates") — ver seção 5, ação manual nº 1.

## 3. Revisão de segurança dos próprios workflows (item 7 do card)
| Item do card | Situação |
|---|---|
| Permissões mínimas | ✅ Já tinha `permissions: contents: read` no root. Nenhum job precisa de mais que isso hoje. |
| Secrets no GitHub Secrets | ✅ Único uso é `secrets.GITHUB_TOKEN` (automático) no gitleaks-action. Nenhum secret de terceiro (Vercel/Neon/PSP) é usado nos workflows do CI. |
| Sem credencial no YAML | ✅ Conferido — nenhuma string com cara de credencial no `ci.yml`. |
| Actions de terceiros usadas | `actions/checkout`, `actions/setup-node`, `actions/setup-python`, `actions/upload-artifact` (todas oficiais do GitHub) + `gitleaks/gitleaks-action` (terceiro, mas muito usado/mantido). Pinadas por tag de versão maior (`@v4`/`@v5`/`@v2`), não por SHA — é o padrão aceitável e mais comum; pin por SHA é mais rígido mas exige atualização manual constante (trade-off documentado, não implementado por ora — YAGNI). |
| Proteção de branch | Configurada para `develop`/`main` (é o que já vínhamos usando — os pushes diretos são bloqueados, força PR). |
| Quem pode alterar workflows | **Não verificado nesta sessão** — é uma configuração de Settings → Actions → General (ou regra de CODEOWNERS para `.github/workflows/`), não um arquivo. Ação manual (seção 5, item 4). |
| Execução segura de PR de fork | ✅ Trigger é `pull_request` (não `pull_request_target`) — já seguro por padrão. |

## 4. Arquivos
**Novos:** `scripts/security/sast-gate.mjs`, `security/sast-exceptions.json`,
`docs/SEG-021-CICD-DEVSECOPS.md` (este arquivo).
**Alterado:** `.github/workflows/ci.yml` (novo job `sast`; nada nos outros
3 jobs foi tocado).

## 5. Ações manuais (não dá pra fazer por arquivo)
1. **Settings → Branches** (regras de `develop` e `main`): adicionar
   **"Dependências (SCA)"** (pendente desde o SEG-013) e **"SAST (Semgrep)"**
   (novo) à lista de required status checks, junto dos 2 que já estavam lá.
   **Isso é o item mais importante desta entrega** — sem isso, os gates
   existem mas não bloqueiam merge de verdade.
2. Confirmar que **"Require branches to be up to date before merging"**
   está ativo nessa mesma tela (garante que o PR roda a esteira contra o
   código mais recente da base, não uma versão desatualizada).
3. Revisar **quem pode aprovar PR** e **quem pode fazer push direto**
   (Settings → Branches → "Restrict who can push").
4. Revisar **quem pode editar arquivos em `.github/workflows/`** — via regra
   de branch protection com "Restrict who can push to matching branches"
   aplicada a um padrão que cubra o diretório, ou via CODEOWNERS
   (`.github/CODEOWNERS` com `/.github/workflows/ @robsonmaia`, por
   exemplo) — não implementado nesta entrega, decisão de quem deve revisar
   fica com o time.

## 6. Referências externas sem contexto disponível
O card menciona alinhamento com **TEC-009 — Staging** e **TEC-016 —
Pipeline de build**. Não tenho acesso ao conteúdo desses cards nesta
sessão — não vou supor o que eles pedem. O que existe hoje no projeto
(`docs/HOMOLOGACAO.md`/`fluxo-de-trabalho.md`) é: `develop` = homologação
(deploy automático de Preview), `main` = produção (só via PR
`develop → main`, CI verde obrigatório). Se TEC-009/016 pedirem um ambiente
de **staging** distinto de homolog, isso é mudança de infraestrutura fora
do escopo do que dá pra inferir aqui — **confirmar com quem escreveu esses
dois cards antes de considerar o item 6 do SEG-021 fechado.**

## 7. Testes (evidência exigida pelo card)

### Teste 1 — Segredo exposto
Este mecanismo (gitleaks) já existia antes deste card (SEG-005) — não gerei
evidência nova nesta sessão porque não participei da implementação original.
**Ação:** se não houver evidência já registrada do SEG-005, repetir o roteiro
abaixo numa branch descartável:
```powershell
git checkout -b test/seg-021-secret
# adicionar uma linha reconhecível, ex.: uma AWS key de exemplo (fake) num arquivo novo
git add . ; git commit -m "test: segredo fake para validar secret scan (nao mergear)"
git push origin test/seg-021-secret
```
Abrir o PR, confirmar que "Secret Scan" falha, depois descartar a branch
sem mergear.

### Teste 2 — Dependência vulnerável
**Já feito e documentado no SEG-013** (`axios@0.21.0`, PR de teste,
`npm audit` bloqueou, evidência no log do CI). Não precisa repetir — é a
mesma esteira, mesmo mecanismo.

### Teste 3 — Falha de SAST (novo, fazer agora)
Numa branch descartável, nunca em `develop`/`main`:
```powershell
git checkout -b test/seg-021-sast
```
Criar um arquivo temporário `src/teste-seg-021-sast.ts`:
```typescript
// TEMP — só para validar o gate de SAST (SEG-021). Não mergear.
export function testeInseguro(entrada: string) {
  return eval(entrada);
}
```
```powershell
git add src/teste-seg-021-sast.ts
git commit -m "test: padrao inseguro para validar SAST (nao mergear)"
git push origin test/seg-021-sast
```
Abrir o PR contra `develop` e conferir na aba Checks:
1. Semgrep identifica o `eval()` (regra de `p/javascript` costuma pegar
   isso como ERROR — "eval-detected" ou similar).
2. O job **"SAST (Semgrep)"** falha (vermelho).
3. O relatório (`semgrep-report`, artifact) mostra o finding.
4. O merge fica bloqueado (depois que o check virar `required` — seção 5).

**Depois do teste:** fechar o PR **sem mergear**, apagar `src/teste-seg-021-sast.ts`
e a branch local/remota — nunca deixar esse arquivo em `develop`.

## 8. Riscos / observações
- Semgrep com rulesets públicos tem falso-positivo ocasional — se aparecer
  um bloqueio genuinamente incorreto (não um risco real), o caminho é a
  exceção documentada em `security/sast-exceptions.json`, nunca desabilitar
  a regra globalmente.
- Rodar Semgrep soma tempo à esteira (baixa os rulesets a cada execução) —
  se isso incomodar no dia a dia, dá pra cachear os rulesets entre runs
  (`actions/cache` na pasta `~/.semgrep`) como otimização futura, não feita
  agora (YAGNI até virar problema real).
- Pin de actions por tag major (não SHA) é um trade-off aceito, não um erro
  — documentado na seção 3.
