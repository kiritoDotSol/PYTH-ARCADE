export interface AssetInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

const CACHE_KEY = 'coingecko_assets_cache';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function fetchCoinGeckoAssets(): Promise<Record<string, AssetInfo>> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed.data;
      }
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false'
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const coins: any[] = await response.json();
    const assetsMap: Record<string, AssetInfo> = {};

    coins.forEach(coin => {
      const asset: AssetInfo = {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image
      };
      // Map by uppercase symbol (e.g. BTC)
      // Some symbols might collide, but for major coins it's mostly fine.
      if (!assetsMap[asset.symbol]) {
         assetsMap[asset.symbol] = asset;
      }
      // Also map by direct ID just in case
      assetsMap[asset.id] = asset;
    });

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: assetsMap
      })
    );

    return assetsMap;
  } catch (error) {
    console.error('Failed to fetch CoinGecko assets:', error);
    // If cache exists but expired, return it as fallback if network fails
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached).data;
    }
    return {};
  }
}
