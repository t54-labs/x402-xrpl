// Common function to get the base explorer URL
export function getExplorerUrl() {
  return process.env.NEXT_PUBLIC_XRPL_NETWORK === "mainnet" 
    ? "https://livenet.xrpl.org" 
    : "https://testnet.xrpl.org";
}
