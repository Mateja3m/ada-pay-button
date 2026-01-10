This folder contains a **demo application only**.

It exists to:
- Test the `@idoa/ada-pay-button` package
- Validate wallet integrations
- Demonstrate correct usage patterns

> ⚠️ This demo is **not** part of the npm package API and may change freely.

---

## Tech Stack

- React
- Vite
- Lucid
- Blockfrost
- CIP-30 wallets (Preview network)

---

## Running the Demo

Requirements:
- A CIP-30 compatible wallet (Lace, Eternl, Vespr, etc.)
- Wallet set to **Preview** network
- Test ADA in the wallet
- A Blockfrost **Preview** API key
- Blockfrost offers a free tier suitable for local testing

```bash
cd demo
npm install
npm run dev