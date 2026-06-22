# Wave — Intelligent Condominium Management on Stellar

> **Submitted to:** Stellar Pulse Hackathon (DoraHacks #2247)
> **Live Demo:** [wave-v2-two.vercel.app](https://wave-v2-two.vercel.app)
> **Network:** Stellar Testnet

---

## The Problem

Brazil has over **500,000 condominiums** managing tens of billions of reais annually. Three structural failures plague the sector:

1. **No financial transparency** — Residents pay monthly fees into collective budgets they cannot verify. Receipts and expense reports are editable PDFs. Managers can alter documents after the fact with no trace.

2. **Governance without proof** — Assembly decisions (votes, minutes) exist only as Word documents that can be edited, backdated, or lost. Average in-person attendance is below 30%, meaning major financial decisions are made by a minority with no tamper-evident record.

3. **Payments disconnected from decisions** — There is no cryptographic link between a payment and the deliberation that authorized it. A manager can pay invoices not approved in assembly, and there is no technical mechanism preventing this — only trust.

**Result:** chronic distrust, conflicts, and litigation. Condominium disputes are one of the most common categories in Brazilian civil courts.

---

## The Solution

Wave is a condominium management platform where every critical event generates a **SHA-256 hash anchored on the Stellar blockchain** via `memo_hash`. The document itself never goes on-chain (preserving LGPD/privacy compliance) — only its cryptographic fingerprint does.

The payment layer goes further: **boleto (monthly fee) payments are settled via USDC on the Stellar network**, creating an on-chain record linked to the deliberation that authorized it.

The blockchain layer is **completely invisible to end users**. Residents log in with email and password. No wallets, no crypto, no jargon.

---

## How It Works — Stellar Integration

### 1. Governance Anchoring
```
Assembly vote closed / Minute approved / Document signed
        ↓
SHA-256 hash generated server-side (Next.js Server Action)
        ↓
Hash anchored on Stellar Testnet via memo_hash transaction
        ↓
Stellar tx hash stored — verifiable by any resident at any time
        ↓
"Verify authenticity" button: recomputes hash and compares to on-chain record
```

### 2. Boleto Payment via Stellar Rails
```
Resident clicks "Pay via Stellar"
        ↓
[Step 1] BRL → USDC conversion (Abroad Finance mock — production-ready architecture)
        ↓
[Step 2] Real USDC transfer on Stellar Testnet (operator account → admin account)
        ↓
[Step 3] Payment receipt hash anchored on Stellar (memo_hash)
        ↓
Full audit trail: on-chain settlement + tamper-evident receipt
```

### Key Technical Choices
- **No smart contracts needed** — `memo_hash` on simple XLM/USDC transactions is sufficient for timestamping and proof-of-integrity at this stage
- **Custodial model** — only Wave's operator account signs Stellar transactions; residents never need wallets (this is by design, not a limitation)
- **Abroad Finance compatible** — the on-ramp architecture (BRL → USDC → Stellar) is designed to plug in Abroad's real API when credentials are available; currently uses a mock that simulates the conversion at 1 USDC = R$ 5.00
- **USDC on Stellar Testnet** — Circle's USDC issuer on testnet (`GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`)

---

## Live Demo

**URL:** [wave-v2-two.vercel.app](https://wave-v2-two.vercel.app)

### Test Credentials
| Role | Email | Password |
|---|---|---|
| Síndico (Manager) | `sindico@wave.com` | any |
| Admin | `admin@wave.com` | any |
| Resident | `morador@wave.com` | any |

### Key Flows to Test
1. **Governance:** Login as Síndico → create proposal → go to Admin Panel → approve → check Blockchain Registry → click "Ver na Stellar" to see real testnet transaction
2. **Payment:** Login as any user → go to Boletos → click "Pagar via Stellar" on a pending boleto → watch the 3-step flow with real Stellar settlement
3. **Document integrity:** Upload a document → approve in Admin Panel → verify hash on Stellar Expert

> **Note:** Stellar transactions require `WAVE_STELLAR_SECRET` to be configured. The live demo has this set via Vercel environment variables.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Radix UI, Lucide Icons, Playfair Display (serif) |
| Blockchain | `@stellar/stellar-sdk` — Stellar Testnet |
| State | React Hooks + LocalStorage (mock backend for demo) |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── blockchain.ts     # Server Actions: hash anchoring
│   │   └── payment.ts        # Server Actions: Stellar payment flow
│   └── dashboard/            # All app routes
├── lib/
│   ├── stellar.ts            # Core: hash anchoring via memo_hash
│   └── stellar-payment.ts    # Core: USDC payment settlement
├── components/
│   ├── Boletos.tsx           # Boleto management + Stellar payment
│   ├── PagamentoStellarModal.tsx  # 3-step payment UI
│   ├── BlockchainRegistry.tsx     # Audit trail viewer
│   └── dao/Governance.tsx    # Proposals + voting
└── hooks/
    ├── useContracts.ts       # Blockchain interaction hook
    └── useBlockchainAutoRegistry.ts  # Auto-registration hook
```

---

## Running Locally

### 1. Clone and install
```bash
git clone https://github.com/ravenahash/wave-v2.git
cd wave-v2
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Generate a Stellar Testnet account:
1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Click "Generate keypair" → "Fund Account with Friendbot"
3. Copy the **Secret Key** (starts with `S...`) to `WAVE_STELLAR_SECRET` in `.env.local`

### 3. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| Hash anchoring (governance) | ✅ Done | Votes, minutes, documents |
| USDC payment settlement | ✅ Done | Testnet, mock on-ramp |
| Abroad Finance integration | 🔜 Next | Real BRL → USDC rails |
| Production backend | 🔜 Next | Replace LocalStorage with Postgres |
| Soroban smart contracts | 🔮 Future | On-chain quorum automation |

---

## Team

**Wave** is built by team based in Rio de Janeiro and São Paulo, Brazil:

- **Renata França** — Cartographer Engineer, Real Estate Broker, MBA in Project Management (FGV), Postgraduate in Blockchain in course
- **Melissa Tatiane** — Architect, Real Estate Operations, Postgraduate in Blockchain in course
- **Robson Maia** - Blockchain Developer, Postgraduate in Blockchain in course

We are building Wave to solve a problem we see every day in the Brazilian real estate market.

---

## Links

- 🌐 **Live Demo:** [wave-v2-two.vercel.app](https://wave-v2-two.vercel.app)
- 📦 **Repository:** [github.com/ravenahash/wave-v2](https://github.com/ravenahash/wave-v2)
- 🔭 **Stellar Testnet Explorer:** [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
