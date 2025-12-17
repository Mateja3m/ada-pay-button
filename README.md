# ADA Pay Button

Minimal, open-source ADA payment button for Cardano wallets (CIP-30).

This package provides a lightweight React component that allows users to send ADA
using an installed Cardano wallet (e.g. Lace, Vespr, Eternl) with minimal setup.

> ⚠️ **Early MVP (v0.1)**  
> The API is stable for basic payments. Advanced UX, theming, analytics,
> mobile flows, and expanded wallet support are planned for future versions.

---

## Features

- CIP-30 wallet support
- Simple ADA payments (lovelace)
- Uses Lucid for transaction construction
- Uses Blockfrost as a chain provider
- Preview / Preprod friendly
- No UI framework dependency
- Browser-safe (no `require`, no Node APIs)

---

## Installation

```bash
npm install @idoa/ada-pay-button
