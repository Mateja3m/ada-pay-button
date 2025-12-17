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
  if (!lucidDeps?.Blockfrost || !lucidDeps?.Lucid) {
    throw new Error(
      "Missing lucidDeps. Pass { Blockfrost, Lucid } from lucid-cardano."
    );
  }
  if (!blockfrostApiKey) throw new Error("Missing blockfrostApiKey");
  if (!network) throw new Error("Missing network");
  if (!walletName) throw new Error("Missing walletName");
  if (!toAddress) throw new Error("Missing toAddress");

  const wallet = window?.cardano?.[walletName];
  if (!wallet?.enable)
    throw new Error(`Wallet "${walletName}" not found on window.cardano`);

  onStatus?.("enabling_wallet");
  const api = await wallet.enable();

  const { Blockfrost, Lucid } = lucidDeps;

  onStatus?.("initializing_lucid");
  const provider = new Blockfrost(getBlockfrostUrl(network), blockfrostApiKey);
  const lucid = await Lucid.new(provider, network);
  lucid.selectWallet(api);

  const amount = Number(lovelace);

  onStatus?.("building_tx");
  const tx = await lucid
    .newTx()
    .payToAddress(toAddress, { lovelace: amount })
    .complete();

  onStatus?.("signing_tx");
  const signed = await tx.sign().complete();

  onStatus?.("submitting_tx");
  const txHash = await signed.submit();

  onStatus?.("submitted");
  return { txHash };
}
