function getBlockfrostUrl(network) {
  if (network === "Mainnet")
    return "https://cardano-mainnet.blockfrost.io/api/v0";
  if (network === "Preprod")
    return "https://cardano-preprod.blockfrost.io/api/v0";
  return "https://cardano-preview.blockfrost.io/api/v0";
}

export async function payWithLucid({
  lucidDeps,
  blockfrostApiKey,
  network,
  walletName,
  toAddress,
  lovelace,
  onStatus,
}) {
  // missing config checks
  if (!lucidDeps?.Blockfrost || !lucidDeps?.Lucid) {
    throw new Error(
      "Missing lucidDeps. Pass { Blockfrost, Lucid } from lucid-cardano."
    );
  }
  if (!blockfrostApiKey) throw new Error("Missing blockfrostApiKey");
  if (!network) throw new Error("Missing network");
  const allowedNetworks = new Set(["Mainnet", "Preprod", "Preview"]);
  if (!allowedNetworks.has(network)) {
    throw new Error('Invalid network. Use "Mainnet", "Preprod", or "Preview".');
  }

  if (!walletName) throw new Error("Missing walletName");
  if (!toAddress) throw new Error("Missing toAddress");
  if (
    lovelace === undefined ||
    lovelace === null ||
    String(lovelace).trim() === ""
  ) {
    throw new Error("Missing lovelace amount");
  }

  // locate the CIP-30 wallet on window.cardano
  const wallet = window?.cardano?.[walletName];
  if (!wallet?.enable)
    throw new Error(`Wallet "${walletName}" not found on window.cardano`);

  onStatus?.("enabling wallet");
  const api = await wallet.enable();

  const { Blockfrost, Lucid } = lucidDeps;

  onStatus?.("initializing lucid");
  const provider = new Blockfrost(getBlockfrostUrl(network), blockfrostApiKey);
  const lucid = await Lucid.new(provider, network);
  lucid.selectWallet(api);
  const amount =
    typeof lovelace === "bigint" ? lovelace : BigInt(String(lovelace));

  if (amount <= 0n) {
    throw new Error("Lovelace amount must be greater than zero");
  }
  onStatus?.("building tx");
  const tx = await lucid
    .newTx()
    .payToAddress(toAddress, { lovelace: amount })
    .complete();

  onStatus?.("signing tx");
  const signed = await tx.sign().complete();

  onStatus?.("submitting tx");
  const txHash = await signed.submit();

  onStatus?.("submitted");
  return { txHash };
}
