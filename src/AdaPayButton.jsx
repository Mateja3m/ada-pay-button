import React, { useMemo, useState } from "react";
import { payWithLucid } from "./payWithLucid.js";

export function AdaPayButton({
  lucidDeps,
  blockfrostApiKey,
  network = "Preview",
  walletName,
  toAddress,
  lovelace,
  onSuccess,
  onError,
  disabled = false,
  showAdaSymbol = true,
  children,
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  const canPay = useMemo(() => {
    return (
      !disabled &&
      !loading &&
      !!lucidDeps?.Blockfrost &&
      !!lucidDeps?.Lucid &&
      !!blockfrostApiKey &&
      !!walletName &&
      !!toAddress &&
      lovelace !== undefined &&
      lovelace !== null &&
      String(lovelace).length > 0
    );
  }, [
    disabled,
    loading,
    lucidDeps,
    blockfrostApiKey,
    walletName,
    toAddress,
    lovelace,
  ]);

  async function handleClick() {
    setStatus("");
    setTxHash("");
    setLoading(true);

    try {
      const result = await payWithLucid({
        lucidDeps,
        blockfrostApiKey,
        network,
        walletName,
        toAddress,
        lovelace,
        onStatus: setStatus,
      });

      setTxHash(result.txHash);
      onSuccess?.(result);
    } catch (err) {
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "inline-block" }}>
      <button
        onClick={handleClick}
        disabled={!canPay}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #111827",
          background: canPay ? "#111827" : "#9ca3af",
          color: "white",
          fontWeight: 600,
          cursor: canPay ? "pointer" : "not-allowed",
        }}
      >
        {loading
          ? "Processing..."
          : children ?? (showAdaSymbol ? "₳ Pay with ADA" : "Pay with ADA")}
      </button>

      {status ? (
        <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
          Status: {status}
        </div>
      ) : null}

      {txHash ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#065f46",
            wordBreak: "break-all",
          }}
        >
          TxHash: <code>{txHash}</code>
        </div>
      ) : null}
    </div>
  );
}
