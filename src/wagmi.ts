/// <reference types="vite/client" />
import '@rainbow-me/rainbowkit/styles.css';
import {
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  phantomWallet,
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c552af22709280d9ce45d820b2f56708'; // Default public project ID for testing

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        phantomWallet,
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'Pyth Arcade',
    projectId,
  }
);

export const config = createConfig({
  connectors,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: false,
});
