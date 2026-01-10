import React, { useEffect, useMemo, useState } from "react";
import { AdaPayButton } from "@idoa/ada-pay-button";

// Replace with your own address before sending funds.
const DEFAULT_RECIPIENT =
  "addr_test1qq2kg0u7955pxx4d3nvjk23mrtfqxmhnqdyhv7n0e9958kfrsae7ftn3ehv353laaltrhzmv4wm8qvr29tdwz5x6rwpqa52efl";

function detectWallets() {
  const names = [];
  const c = window?.cardano;
  if (!c) return names;

  const candidates = [
    "lace",
    "eternl",
    "nami",
    "vespr",
    "typhoncip30",
    "yoroi",
    "flint",
    "gerowallet",
  ];

  for (const k of candidates) {
    if (c?.[k]?.enable) names.push(k);
  }

  for (const [k, v] of Object.entries(c)) {
    if (!names.includes(k) && v?.enable) names.push(k);
  }

  return Array.from(new Set(names));
}

async function loadLucidWeb() {
  // Use Lucid's browser build (CSL/WASM wired correctly)
  // Version should match your peerDependency version to avoid surprises
  const mod = await import(
    /* @vite-ignore */
    "https://cdn.jsdelivr.net/npm/lucid-cardano@0.10.11/web/mod.js"
  );

  return { Blockfrost: mod.Blockfrost, Lucid: mod.Lucid };
}

export default function App() {
  const [network, setNetwork] = useState("Preview");
  const [walletName, setWalletName] = useState("lace");
  const [toAddress, setToAddress] = useState(DEFAULT_RECIPIENT);
  const [lovelace, setLovelace] = useState(1000000);
  const [editingFullAddr, setEditingFullAddr] = useState(false);

  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [err, setErr] = useState("");

  const [lucidDeps, setLucidDeps] = useState(null);
  const [loadErr, setLoadErr] = useState("");

  const wallets = useMemo(() => detectWallets(), []);

  useEffect(() => {
    if (wallets.length && !wallets.includes(walletName)) {
      setWalletName(wallets[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets.join(",")]);

  useEffect(() => {
    (async () => {
      try {
        setLoadErr("");
        setStatus("loading lucid");
        const deps = await loadLucidWeb();
        setLucidDeps(deps);
        setStatus("lucid loaded");
      } catch (e) {
        setLoadErr(String(e?.message || e));
        setStatus("");
      }
    })();
  }, []);

  const blockfrostApiKey = import.meta.env.VITE_BLOCKFROST_KEY;
  const canRender = !!blockfrostApiKey && !!lucidDeps;

  //

  function shortAddr(addr, left = 12, right = 10) {
    if (!addr) return "";
    if (addr.length <= left + right + 3) return addr;
    return `${addr.slice(0, left)}...${addr.slice(-right)}`;
  }

  async function safeCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        return true;
      } catch {
        return false;
      }
    }
  }

  // add this effect inside App() to support ESC close
  useEffect(() => {
    if (!editingFullAddr) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setEditingFullAddr(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingFullAddr]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f6f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 980 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 44, letterSpacing: -0.6 }}>
            ADA Pay Button Demo Application
          </h1>
          <p style={{ marginTop: 10, color: "#475569" }}>
            Connect a CIP-30 wallet on <b>{network}</b>, fund it with{" "}
            {network === "Mainnet" ? "real ADA" : "test ADA"}, and send a
            payment.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(15, 23, 42, 0.10)",
            borderRadius: 16,
            boxShadow: "0 12px 30px rgba(2, 6, 23, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 0,
            }}
          >
            {/* Left panel: form */}
            <div style={{ padding: 18 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <label>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Network
                  </div>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid rgba(15, 23, 42, 0.14)",
                      background: "#ffffff",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  >
                    <option value="Preview">Preview</option>
                    <option value="Preprod">Preprod</option>
                    <option value="Mainnet">Mainnet</option>
                  </select>
                </label>

                <label>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Wallet (CIP-30)
                  </div>
                  <select
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: 360,
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid rgba(15, 23, 42, 0.14)",
                      background: "#ffffff",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  >
                    {wallets.length ? (
                      wallets.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))
                    ) : (
                      <option value="lace">No wallets detected</option>
                    )}
                  </select>

                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                    Detected: {wallets.length ? wallets.join(", ") : "none"}
                  </div>
                </label>

                <div style={{ display: "block" }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Recipient (address)
                  </div>

                  {/* Preview row */}
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <input
                      id="recipient-preview"
                      value={shortAddr(toAddress, 18, 14)}
                      readOnly
                      onClick={() => setEditingFullAddr(true)}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid #d8dee9",
                        outline: "none",
                        fontSize: 13,
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    />

                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await safeCopy(toAddress);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Copy
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingFullAddr(true);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Edit
                    </button>
                  </div>

                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                    Copy always copies the full value. Edit opens a modal for
                    the full address.
                  </div>

                  {/* Modal */}
                  {editingFullAddr ? (
                    <div
                      role="dialog"
                      aria-modal="true"
                      onMouseDown={(e) => {
                        // close ONLY if the overlay itself was clicked
                        if (e.target === e.currentTarget)
                          setEditingFullAddr(false);
                      }}
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        zIndex: 1000,
                      }}
                    >
                      <div
                        onMouseDown={(e) => e.stopPropagation()} // prevent overlay close
                        style={{
                          width: "min(860px, 100%)",
                          background: "#fff",
                          borderRadius: 16,
                          padding: 16,
                          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>
                            Edit recipient address
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingFullAddr(false)}
                            style={{
                              border: "1px solid #e2e8f0",
                              background: "#fff",
                              borderRadius: 10,
                              padding: "6px 10px",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Close
                          </button>
                        </div>

                        <textarea
                          value={toAddress}
                          onChange={(e) => setToAddress(e.target.value)}
                          spellCheck={false}
                          style={{
                            width: "100%",
                            height: 120,
                            maxHeight: "40vh",
                            resize: "vertical",
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1px solid #d8dee9",
                            fontSize: 13,
                            lineHeight: "20px",
                            boxSizing: "border-box",
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        />

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          <button
                            type="button"
                            onClick={async () => {
                              await safeCopy(toAddress);
                            }}
                            style={{
                              border: "1px solid #e2e8f0",
                              background: "#fff",
                              borderRadius: 12,
                              padding: "10px 14px",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Copy full
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingFullAddr(false)}
                            style={{
                              border: "1px solid #0f172a",
                              background: "#0f172a",
                              color: "#fff",
                              borderRadius: 12,
                              padding: "10px 14px",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Done
                          </button>
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          Tip: Press <b>Esc</b> to close.
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <label>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Amount (lovelace)
                  </div>
                  <input
                    type="number"
                    value={lovelace}
                    onChange={(e) => setLovelace(Number(e.target.value))}
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid rgba(15, 23, 42, 0.14)",
                      background: "#ffffff",
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                    1 ADA = 1,000,000 lovelace
                  </div>
                </label>

                {!blockfrostApiKey ? (
                  <div
                    style={{
                      marginTop: 4,
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.06)",
                      color: "#991b1b",
                      fontSize: 13,
                    }}
                  >
                    Missing Blockfrost key. Create <code>.env</code> in{" "}
                    <code>demo</code> with: <code>VITE_BLOCKFROST_KEY=...</code>
                  </div>
                ) : null}

                {loadErr ? (
                  <div
                    style={{
                      marginTop: 4,
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.06)",
                      color: "#991b1b",
                      fontSize: 13,
                    }}
                  >
                    Failed to load Lucid web build: <code>{loadErr}</code>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right panel: action + status */}
            <div
              style={{
                padding: 18,
                background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                borderLeft: "1px solid rgba(15, 23, 42, 0.08)",
                display: "grid",
                alignContent: "start",
                gap: 12,
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  Ready to pay on <b>{network}</b>
                </div>

                {!canRender ? (
                  <button
                    disabled
                    style={{
                      width: "fit-content",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(15, 23, 42, 0.18)",
                      background: "#94a3b8",
                      color: "white",
                      fontWeight: 700,
                      cursor: "not-allowed",
                    }}
                  >
                    Loading…
                  </button>
                ) : (
                  <AdaPayButton
                    lucidDeps={lucidDeps}
                    blockfrostApiKey={blockfrostApiKey}
                    network={network}
                    walletName={walletName}
                    toAddress={toAddress}
                    lovelace={lovelace}
                    onSuccess={(r) => {
                      setErr("");
                      setTxHash(r.txHash);
                      setStatus("submitted");
                    }}
                    onError={(e) => {
                      setTxHash("");
                      setErr(String(e?.message || e));
                      setStatus("error");
                    }}
                  >
                    ₳ Pay with ADA
                  </AdaPayButton>
                )}
              </div>

              <div
                style={{
                  marginTop: 4,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(15, 23, 42, 0.10)",
                  background: "#ffffff",
                }}
              >
                <div style={{ fontSize: 13, color: "#0f172a" }}>
                  <span style={{ color: "#64748b" }}>Status:</span>{" "}
                  <b>{status || "(use wallet popup to proceed)"}</b>
                </div>

                {txHash ? (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <div style={{ color: "#64748b", marginBottom: 6 }}>
                      TxHash
                    </div>
                    <div
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(15, 23, 42, 0.10)",
                        background: "#f8fafc",
                        wordBreak: "break-all",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        fontSize: 12,
                      }}
                    >
                      {txHash}
                    </div>
                  </div>
                ) : null}

                {err ? (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.06)",
                      color: "#991b1b",
                      fontSize: 13,
                      wordBreak: "break-word",
                    }}
                  >
                    Error: <code>{err}</code>
                  </div>
                ) : null}
              </div>

              <div style={{ fontSize: 12, color: "#64748b" }}>
                Note: Ensure your wallet is set to <b>{network}</b> and funded
                with {network === "Mainnet" ? "real ADA" : "test ADA"}.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          Demo app only. The npm package remains the reusable{" "}
          <b>AdaPayButton</b>.
        </div>
      </div>
    </div>
  );
}
