export const ASSET_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  PYTH: 'pyth-network',
  DOGE: 'dogecoin',
  SUI: 'sui',
  ADA: 'cardano',
  DOT: 'polkadot',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  PEPE: 'pepe',
  SHIB: 'shiba-inu',
  OP: 'optimism',
  ARB: 'arbitrum',
  APT: 'aptos',
  XRP: 'ripple',
  XEC: 'ecash',
  XDC: 'xdc-network',
  NEAR: 'near',
  RON: 'ronin',
  IOTA: 'iota',
  OM: 'mantra-dao',
  PAXG: 'pax-gold',
  TNSR: 'tensor',
  ALICE: 'my-neighbor-alice',
  DEGEN: 'degen-base',
  IMX: 'immutable-x'
};

// Returns CoinGecko ID if mapped, otherwise false
export function getCoinGeckoId(symbol: string): string | null {
  return ASSET_MAP[symbol.toUpperCase()] || null;
}
