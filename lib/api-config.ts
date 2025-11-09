// API Configuration
export const API_CONFIG = {
  mobula: {
    baseUrl: 'https://api.mobula.io/api/1',
    apiKey: process.env.MOBULA_API_KEY,
  },
  coinMarketCap: {
    baseUrl: 'https://pro-api.coinmarketcap.com/v1',
    apiKey: process.env.COINMARKETCAP_API_KEY,
  },
  coinGecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY,
  },
  goPlus: {
    baseUrl: 'https://api.gopluslabs.io/api/v1',
    apiKey: process.env.GOPLUS_API_KEY,
  },
} as const

// Type definitions for API responses
export interface TokenData {
  id: string
  name: string
  symbol: string
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
}

export interface SecurityAnalysis {
  contractAddress: string
  isHoneypot: boolean
  riskLevel: 'low' | 'medium' | 'high'
  issues: string[]
}

// API utility functions
export class APIService {
  static async fetchWithAuth(url: string, apiKey: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  static handleError(error: Error | unknown) {
    console.error('API Error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred while fetching data'
    throw new Error(message)
  }
}