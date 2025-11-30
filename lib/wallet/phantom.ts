/**
 * Phantom Wallet Integration
 * Handles connection and token fetching for Solana wallets
 */

interface PhantomProvider {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: string, callback: (args: any) => void) => void
  removeListener: (event: string, callback: (args: any) => void) => void
  publicKey: { toString: () => string } | null
}

declare global {
  interface Window {
    solana?: PhantomProvider
    phantom?: {
      solana?: PhantomProvider
    }
  }
}

export interface WalletToken {
  address: string
  symbol: string
  name: string
  balance: number
  decimals: number
  uiAmount: number
  logoURI?: string
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  return !!(
    window.phantom?.solana?.isPhantom ||
    window.solana?.isPhantom
  )
}

/**
 * Get Phantom provider
 */
export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null
  
  if (window.phantom?.solana?.isPhantom) {
    return window.phantom.solana
  }
  
  if (window.solana?.isPhantom) {
    return window.solana
  }
  
  return null
}

/**
 * Connect to Phantom wallet
 */
export async function connectPhantom(): Promise<string> {
  const provider = getPhantomProvider()
  
  if (!provider) {
    throw new Error('Phantom wallet not installed')
  }
  
  try {
    const response = await provider.connect()
    const publicKey = response.publicKey.toString()
    
    console.log('[Phantom] Connected:', publicKey)
    return publicKey
  } catch (error: any) {
    console.error('[Phantom] Connection failed:', error)
    throw new Error(error.message || 'Failed to connect to Phantom')
  }
}

/**
 * Disconnect from Phantom wallet
 */
export async function disconnectPhantom(): Promise<void> {
  const provider = getPhantomProvider()
  
  if (!provider) return
  
  try {
    await provider.disconnect()
    console.log('[Phantom] Disconnected')
  } catch (error) {
    console.error('[Phantom] Disconnect failed:', error)
  }
}

/**
 * Get wallet address if already connected
 */
export function getConnectedWallet(): string | null {
  const provider = getPhantomProvider()
  
  if (!provider || !provider.publicKey) return null
  
  return provider.publicKey.toString()
}

/**
 * Fetch all tokens in wallet using Helius API
 */
export async function fetchWalletTokens(
  walletAddress: string
): Promise<WalletToken[]> {
  try {
    const response = await fetch('/api/wallet/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch wallet tokens')
    }
    
    const data = await response.json()
    return data.tokens || []
  } catch (error) {
    console.error('[Phantom] Failed to fetch tokens:', error)
    throw error
  }
}
