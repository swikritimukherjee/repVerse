'use client'

import { mainnet, baseSepolia, sepolia, polygon, optimism, arbitrum, base, avalancheFuji } from 'wagmi/chains'
import { http, createConfig } from 'wagmi'

export const config = createConfig({
  chains: [avalancheFuji],
  transports: {
  
    [avalancheFuji.id]: http(),
  },
  ssr: true
})