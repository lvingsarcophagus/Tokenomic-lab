'use client'

import { useState, useEffect } from 'react'
import { Wallet, X } from 'lucide-react'

interface WalletConnectProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    checkIfWalletIsConnected()
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window as any
      if (solana?.isPhantom && solana.isConnected) {
        const response = await solana.connect({ onlyIfTrusted: true })
        const address = response.publicKey.toString()
        setWalletAddress(address)
        onConnect?.(address)
      }
    } catch (error) {
      console.log('Wallet not connected')
    }
  }

  const connectWallet = async () => {
    setConnecting(true)
    try {
      const { solana } = window as any
      
      if (!solana?.isPhantom) {
        alert('Phantom wallet not found! Please install it from phantom.app')
        window.open('https://phantom.app/', '_blank')
        return
      }

      const response = await solana.connect()
      const address = response.publicKey.toString()
      setWalletAddress(address)
      onConnect?.(address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setConnecting(false)
    }
  }


  const disconnectWallet = async () => {
    try {
      const { solana } = window as any
      if (solana) {
        await solana.disconnect()
        setWalletAddress(null)
        onDisconnect?.()
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border-2 border-green-500/30 text-green-400 font-mono text-xs tracking-wider">
        <Wallet className="w-4 h-4" />
        <span>{formatAddress(walletAddress)}</span>
        <button
          onClick={disconnectWallet}
          className="ml-2 p-1 hover:bg-red-500/20 border border-red-500/30 transition-all"
          title="Disconnect"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-white/30 text-white font-mono text-xs hover:bg-white hover:text-black hover:border-white transition-all disabled:opacity-50 tracking-wider"
    >
      <Wallet className="w-4 h-4" />
      {connecting ? 'CONNECTING...' : 'CONNECT PHANTOM'}
    </button>
  )
}
