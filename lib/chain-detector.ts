// Chain detection and address validation utilities

export interface ChainInfo {
  chainId: string
  chainName: string
  isEVM: boolean
  addressFormat: '0x' | 'base58'
}

/**
 * Detect chain from address format
 */
export function detectChain(addressOrSymbol: string): ChainInfo | null {
  const input = addressOrSymbol.trim().toLowerCase()

  // Check if it's a common symbol (not an address)
  const commonSymbols = ['btc', 'eth', 'sol', 'usdt', 'usdc', 'bnb', 'matic', 'ada', 'dot']
  const isSymbol = commonSymbols.includes(input) || (input.length <= 10 && /^[a-z0-9]+$/.test(input))

  // Ethereum/BSC/Polygon/Arbitrum addresses start with 0x and are 42 characters
  if (input.startsWith('0x') && input.length === 42) {
    // Could be Ethereum, BSC, Polygon, Arbitrum, Optimism, Base
    // Default to Ethereum for now (we don't have chain detection for EVM chains yet)
    return {
      chainId: '1',
      chainName: 'Ethereum',
      isEVM: true,
      addressFormat: '0x',
    }
  }

  // Solana addresses are base58 encoded, typically 32-44 characters
  // Solana addresses don't start with 0x and match base58 pattern
  // They're longer than typical symbols (32+ characters)
  if (
    !input.startsWith('0x') && 
    !isSymbol &&
    input.length >= 32 && 
    input.length <= 44 &&
    /^[1-9a-hj-np-z]+$/.test(input)
  ) {
    return {
      chainId: 'solana',
      chainName: 'Solana',
      isEVM: false,
      addressFormat: 'base58',
    }
  }

  // Symbol search - default to Ethereum
  return {
    chainId: '1',
    chainName: 'Ethereum',
    isEVM: true,
    addressFormat: '0x',
  }
}

/**
 * Check if address is valid for chain
 */
export function isValidAddress(address: string, chain: ChainInfo): boolean {
  if (chain.addressFormat === '0x') {
    return address.startsWith('0x') && address.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(address)
  }
  
  if (chain.addressFormat === 'base58') {
    // Solana base58 validation (basic check)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }

  return false
}

/**
 * Get GoPlus chain ID for EVM chains
 */
export function getGoPlusChainId(chainId: string): string | null {
  const chainMap: Record<string, string> = {
    '1': '1',        // Ethereum
    '56': '56',      // BSC
    '137': '137',    // Polygon
    '42161': '42161', // Arbitrum
    '10': '10',      // Optimism
    '8453': '8453',  // Base
  }
  
  return chainMap[chainId] || null
}

