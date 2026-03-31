import { create } from 'zustand';
import { fetchCoinGeckoAssets, AssetInfo } from '../services/assetService';
import { getCoinGeckoId } from '../utils/assetMap';

interface AssetStore {
  assets: Record<string, AssetInfo>;
  loaded: boolean;
  loadAssets: () => Promise<void>;
  getAssetImg: (symbol: string) => string | null;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: {},
  loaded: false,
  loadAssets: async () => {
    if (get().loaded) return;
    try {
      const data = await fetchCoinGeckoAssets();
      set({ assets: data, loaded: true });
    } catch (err) {
      console.warn('Failed to resolve assets', err);
    }
  },
  getAssetImg: (symbol: string) => {
    const { assets } = get();
    const upperSym = symbol.toUpperCase();
    
    if (assets[upperSym]) return assets[upperSym].image;
    
    const cgid = getCoinGeckoId(upperSym);
    if (cgid && assets[cgid]) return assets[cgid].image;
    
    return null;
  }
}));

export function useAssets() {
  const loadAssets = useAssetStore(state => state.loadAssets);
  const getAssetImg = useAssetStore(state => state.getAssetImg);
  const loaded = useAssetStore(state => state.loaded);
  const assets = useAssetStore(state => state.assets);
  
  return { loadAssets, getAssetImg, loaded, assets };
}
