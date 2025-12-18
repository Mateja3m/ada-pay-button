# ADA Pay Button

Minimal, open-source ADA payment button for Cardano wallets (CIP-30).

This package provides a lightweight React component that allows users to send ADA
using an installed Cardano wallet (e.g. Lace, Vespr, Eternl) with minimal setup.

> ⚠️ **Early MVP (v0.1)**  
> The API supports basic payments. Advanced UX, theming, analytics,
> mobile flows, and expanded wallet support are planned for future versions.

---

## Features

- CIP-30 wallet support
- Simple ADA payments (lovelace)
- Uses Lucid for transaction construction
- Uses Blockfrost as a default chain provider (configurable)
- Preview / Preprod friendly
- No UI framework dependency
- Browser-safe (no `require`, no Node APIs)

---

## Non-Goals (v0.1)

- No mobile wallet deep-link support
- No multi-asset or NFT payments
- No invoices, webhooks, or order tracking
- No theming or UI customization
- No wallet abstraction beyond CIP-30

---

## Installation

```bash
npm install @idoa/ada-pay-button
