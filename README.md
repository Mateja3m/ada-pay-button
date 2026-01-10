# ADA Pay Button

A minimal, open-source ADA payment button for Cardano wallets (CIP-30).

This package provides a lightweight React component that enables users to send ADA
using an installed Cardano wallet (e.g. Lace, Vespr, Eternl) with minimal setup and
no UI framework dependency.

> ⚠️ **Early MVP (v0.1)**  
> The API supports basic ADA payments only. Advanced UX, theming, analytics,
> mobile flows, and expanded wallet support are planned for future versions.

---

## Features

- CIP-30 wallet support
- Simple ADA payments (lovelace only)
- Uses **Lucid** for transaction construction
- Uses **Blockfrost** as the default chain provider (configurable)
- Supports **Preview** and **Preprod** networks (Mainnet-ready)
- No UI framework dependency
- Browser-safe (ESM only, no `require`, no Node APIs)

---

## Non-Goals (v0.1)

This package intentionally does **not** include:

- Mobile wallet deep-link support
- Multi-asset or NFT payments
- Invoices, webhooks, or order tracking
- Theming or UI customization APIs
- Wallet abstraction beyond CIP-30

These are explicitly out of scope for the initial release.

---

## Installation

```bash
npm install @idoa/ada-pay-button
