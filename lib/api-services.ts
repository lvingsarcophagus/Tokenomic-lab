import { API_CONFIG, APIService, TokenData, SecurityAnalysis } from './api-config'

// Mobula API Service
export class MobulaService {
  static async getTokenData(tokenAddress: string): Promise<TokenData | null> {
    try {
      const url = `${API_CONFIG.mobula.baseUrl}/market/data?asset=${tokenAddress}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `${API_CONFIG.mobula.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Mobula API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        id: data.data.asset,
        name: data.data.name,
        symbol: data.data.symbol,
        price: data.data.price,
        marketCap: data.data.market_cap,
        volume24h: data.data.volume,
        priceChange24h: data.data.price_change_24h,
      }
    } catch (error) {
      APIService.handleError(error)
      return null
    }
  }
}

// CoinMarketCap API Service
export class CoinMarketCapService {
  /**
   * Map symbol/name to contract address (for EVM chains)
   */
  static async mapSymbol(symbol: string): Promise<{ address: string; chain: string } | null> {
    try {
      const url = `${API_CONFIG.coinMarketCap.baseUrl}/cryptocurrency/map?symbol=${symbol.toUpperCase()}`
      const response = await fetch(url, {
        headers: {
          'X-CMC_PRO_API_KEY': API_CONFIG.coinMarketCap.apiKey || '',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`CoinMarketCap map API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.data && data.data.length > 0) {
                // Try to find the specific ETH token or first valid token
        const ethToken = data.data.find((t: { blockchains?: string[] }) =>
          t.blockchains?.includes('Ethereum')
        ) || data.data.find((t: { platform?: { token_address?: string } }) => t.platform?.token_address)

        if (ethToken?.platform?.token_address) {
          return {
            address: ethToken.platform.token_address,
            chain: ethToken.platform.slug === 'ethereum' ? '1' : '1', // Default to Ethereum
          }
        }
      }

      return null
    } catch (error) {
      APIService.handleError(error)
      return null
    }
  }

  static async getTokenData(symbol: string): Promise<TokenData | null> {
    try {
      const url = `${API_CONFIG.coinMarketCap.baseUrl}/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`
      const response = await fetch(url, {
        headers: {
          'X-CMC_PRO_API_KEY': API_CONFIG.coinMarketCap.apiKey || '',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.data) {
        return null
      }

      const tokenData = Object.values(data.data)[0] as {
        id: number
        name: string
        symbol: string
        quote: {
          USD: {
            price: number
            market_cap: number
            volume_24h: number
            percent_change_24h: number
          }
        }
      }

      if (!tokenData) {
        return null
      }

      return {
        id: tokenData.id.toString(),
        name: tokenData.name,
        symbol: tokenData.symbol,
        price: tokenData.quote.USD.price,
        marketCap: tokenData.quote.USD.market_cap,
        volume24h: tokenData.quote.USD.volume_24h,
        priceChange24h: tokenData.quote.USD.percent_change_24h,
      }
    } catch (error) {
      APIService.handleError(error)
      return null
    }
  }
}

// CoinGecko API Service
export class CoinGeckoService {
  static async getTokenData(tokenId: string): Promise<TokenData | null> {
    try {
      const url = `${API_CONFIG.coinGecko.baseUrl}/simple/price?ids=${tokenId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': API_CONFIG.coinGecko.apiKey || '',
        },
      })

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`)
      }

      const data = await response.json()
      const tokenData = data[tokenId]

      return {
        id: tokenId,
        name: tokenId,
        symbol: tokenId,
        price: tokenData.usd,
        marketCap: tokenData.usd_market_cap,
        volume24h: tokenData.usd_24h_vol,
        priceChange24h: tokenData.usd_24h_change,
      }
    } catch (error) {
      APIService.handleError(error)
      return null
    }
  }
}

// GoPlus API Service
export class GoPlusService {
  static async getSecurityAnalysis(chainId: string, contractAddress: string): Promise<SecurityAnalysis | null> {
    try {
      // Normalize address to lowercase for API
      const normalizedAddress = contractAddress.toLowerCase()
      const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${normalizedAddress}`
      
      console.log('GoPlus API Request:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GoPlus API error:', response.status, errorText)
        throw new Error(`GoPlus API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('GoPlus API Response:', JSON.stringify(data, null, 2))

      // Handle different response formats
      let securityData = null
      
      if (data.result && data.result[normalizedAddress]) {
        securityData = data.result[normalizedAddress]
      } else if (data.result && typeof data.result === 'object') {
        // Try to find the data with any case variation
        const resultKeys = Object.keys(data.result)
        const matchingKey = resultKeys.find(key => key.toLowerCase() === normalizedAddress)
        if (matchingKey) {
          securityData = data.result[matchingKey]
        }
      }

      if (!securityData) {
        console.error('Token not found in GoPlus response:', data)
        // Return a default analysis instead of throwing
        return {
          contractAddress,
          isHoneypot: false,
          riskLevel: 'medium',
          issues: ['Token data not available from GoPlus API'],
        }
      }

      const issues: string[] = []
      
      // Check for various security issues - handle both string and number formats
      const checkFlag = (value: string | number | boolean) => {
        if (typeof value === 'string') return value === '1'
        if (typeof value === 'number') return value === 1
        if (typeof value === 'boolean') return value === true
        return false
      }
      
      if (checkFlag(securityData.is_honeypot)) issues.push('Potential honeypot detected')
      if (checkFlag(securityData.is_blacklisted)) issues.push('Token is blacklisted')
      if (checkFlag(securityData.is_proxy)) issues.push('Uses proxy contract')
      if (checkFlag(securityData.is_mintable)) issues.push('Token is mintable')
      if (checkFlag(securityData.owner_change_balance)) issues.push('Owner can change balance')
      if (checkFlag(securityData.hidden_owner)) issues.push('Hidden owner detected')
      if (checkFlag(securityData.selfdestruct)) issues.push('Self-destruct function present')
      if (checkFlag(securityData.external_call)) issues.push('External call detected')
      
      // Check tax values
      const buyTax = securityData.buy_tax ? parseFloat(String(securityData.buy_tax)) : 0
      const sellTax = securityData.sell_tax ? parseFloat(String(securityData.sell_tax)) : 0
      
      if (buyTax > 10) {
        issues.push(`High buy tax: ${buyTax.toFixed(2)}%`)
      }
      if (sellTax > 10) {
        issues.push(`High sell tax: ${sellTax.toFixed(2)}%`)
      }
      
      if (checkFlag(securityData.cannot_sell_all)) issues.push('Cannot sell all tokens')
      if (checkFlag(securityData.trading_cooldown)) issues.push('Trading cooldown enabled')

      // Calculate risk level based on severity
      let riskScore = 0
      if (checkFlag(securityData.is_honeypot)) riskScore += 50
      if (checkFlag(securityData.is_blacklisted)) riskScore += 30
      if (checkFlag(securityData.cannot_sell_all)) riskScore += 40
      if (checkFlag(securityData.selfdestruct)) riskScore += 35
      if (checkFlag(securityData.hidden_owner)) riskScore += 25
      if (checkFlag(securityData.owner_change_balance)) riskScore += 20
      if (buyTax > 20 || sellTax > 20) riskScore += 15
      if (checkFlag(securityData.is_mintable)) riskScore += 10
      if (checkFlag(securityData.trading_cooldown)) riskScore += 10
      if (checkFlag(securityData.is_proxy)) riskScore += 5

      const riskLevel = riskScore >= 50 ? 'high' : riskScore >= 20 ? 'medium' : 'low'

      return {
        contractAddress,
        isHoneypot: checkFlag(securityData.is_honeypot),
        riskLevel: riskLevel as 'low' | 'medium' | 'high',
        issues,
      }
    } catch (error) {
      console.error('GoPlus API error:', error)
      // Return a fallback response instead of null
      return {
        contractAddress,
        isHoneypot: false,
        riskLevel: 'medium',
        issues: [`Unable to fetch security analysis: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }
}