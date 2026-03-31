import React from 'react';
import { useAssets } from '../hooks/useAssets';

interface Props {
  symbol: string;
  className?: string;
  fallbackColor?: string;
}

export const AssetIcon: React.FC<Props> = ({ 
  symbol, 
  className = 'w-8 h-8 rounded-full shadow-[0_0_10px_rgba(163,255,0,0.5)]', 
  fallbackColor = '#ffffff' 
}) => {
  const { getAssetImg } = useAssets();
  const url = getAssetImg(symbol);

  if (url) {
    return (
      <img
        src={url}
        alt={symbol}
        loading="lazy"
        className={`object-cover object-center ${className}`}
      />
    );
  }

  // Fallback to text + border if no image returned
  return (
    <div
      className={`flex items-center justify-center font-black ${className}`}
      style={{
        backgroundColor: `${fallbackColor}20`,
        color: fallbackColor,
        border: `2px solid ${fallbackColor}50`,
        boxShadow: `0 0 10px ${fallbackColor}50`
      }}
    >
      <span className="text-[0.6em] truncate px-1">
        {symbol.substring(0, 4)}
      </span>
    </div>
  );
};
