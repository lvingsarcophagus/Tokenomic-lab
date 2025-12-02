'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Wallet, X, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import {
  isPhantomInstalled,
  connectPhantom,
  disconnectPhantom,
  getConnectedWallet,
  fetchWalletTokens,
  type WalletToken
} from '@/lib/wallet/phantom'
import Loader from './loader'

interface WalletConnectProps {
  onTokenSelect?: (tokenAddress: string, tokenSymbol: string, tokenName: string) => void
}

export default function WalletConnect({ onTokenSelect }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [tokens, setTokens] = useState<WalletToken[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzingAll, setAnalyzingAll] = useState(false)
  const [bulkResults, setBulkResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  
  useEffect(() => {
    // Check if already connected
    const address = getConnectedWallet()
    if (address) {
      setConnected(true)
      setWalletAddress(address)
    }
  }, [])
  
  const handleConnect = async () => {
    if (!isPhantomInstalled()) {
      setError('Phantom wallet not installed. Please install from phantom.app')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const address = await connectPhantom()
      setConnected(true)
      setWalletAddress(address)
      
      // Fetch tokens
      await loadTokens(address)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('[Wallet] Connection error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const loadTokens = async (address: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const walletTokens = await fetchWalletTokens(address)
      setTokens(walletTokens)
      
      if (walletTokens.length === 0) {
        setError('No tokens found in wallet')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tokens')
      console.error('[Wallet] Token fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDisconnect = async () => {
    await disconnectPhantom()
    setConnected(false)
    setWalletAddress(null)
    setTokens([])
    setIsOpen(false)
  }
  
  const handleTokenClick = (token: WalletToken) => {
    if (onTokenSelect) {
      onTokenSelect(token.address, token.symbol, token.name)
      setIsOpen(false)
    } else {
      // If no callback provided, just close modal
      // User can implement their own token selection logic
      console.log('[Wallet] Token selected:', token)
      setIsOpen(false)
    }
  }
  
  const handleAnalyzeAll = async () => {
    setAnalyzingAll(true)
    setError(null)
    
    try {
      const response = await fetch('/api/wallet/analyze-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: tokens.slice(0, 20), // Limit to first 20 tokens
          plan: 'PREMIUM'
        })
      })
      
      if (!response.ok) {
        throw new Error('Bulk analysis failed')
      }
      
      const data = await response.json()
      setBulkResults(data.results)
      setShowResults(true)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze tokens')
    } finally {
      setAnalyzingAll(false)
    }
  }
  
  const getRiskColor = (riskScore: number | null) => {
    if (riskScore === null) return 'text-gray-400'
    if (riskScore < 30) return 'text-green-400'
    if (riskScore < 60) return 'text-yellow-400'
    if (riskScore < 80) return 'text-orange-400'
    return 'text-red-400'
  }
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }
  
  return (
    <>
      {/* Connect Button - Matches Theme */}
      {!connected ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-transparent border-2 border-white/30 text-white font-mono 
                     text-xs hover:bg-white hover:text-black hover:border-white transition-all 
                     tracking-wider flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          CONNECT PHANTOM WALLET
        </button>
      ) : (
        <div className="space-y-3">
          <div className="p-4 border border-white/10 bg-black/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 font-mono text-[10px] tracking-wider">CONNECTED</span>
              <button
                onClick={handleDisconnect}
                className="text-red-400 hover:text-red-300 font-mono text-[10px] transition-colors"
              >
                DISCONNECT
              </button>
            </div>
            <div className="text-white font-mono text-xs break-all mb-2">
              {formatAddress(walletAddress!)}
            </div>
            <div className="text-white/60 font-mono text-[10px]">
              {tokens.length} TOKEN{tokens.length !== 1 ? 'S' : ''} FOUND
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="w-full px-4 py-2 bg-transparent border-2 border-white/30 text-white font-mono 
                       text-xs hover:bg-white hover:text-black hover:border-white transition-all 
                       tracking-wider"
          >
            VIEW TOKENS & ANALYZE
          </button>
        </div>
      )}
      
      {/* Modal - Rendered via Portal to escape parent container */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black border-2 border-white/30 w-full max-w-3xl max-h-[85vh] flex flex-col backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-1.5 border border-white/30 bg-black/40">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-white font-mono text-xs tracking-wider uppercase">
                  {connected ? 'WALLET PORTFOLIO ANALYSIS' : 'CONNECT PHANTOM WALLET'}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 border border-white/30 bg-black/40 text-white/60 hover:text-white hover:border-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!connected ? (
                /* Not Connected State */
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="p-4 border-2 border-white/30 bg-black/40 inline-block mb-6">
                      <Wallet className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-white/80 font-mono text-xs mb-8 max-w-md mx-auto tracking-wide">
                      Connect your Phantom wallet to analyze all your Solana tokens and get a complete portfolio risk assessment
                    </p>
                    
                    {error && (
                      <div className="mb-6 p-4 border-2 border-red-500/30 bg-red-500/10 text-red-400 
                                    font-mono text-xs flex items-start gap-2 max-w-md mx-auto">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={handleConnect}
                      disabled={loading}
                      className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-mono 
                               text-xs hover:bg-white hover:text-black hover:border-white transition-all 
                               disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto tracking-wider"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          CONNECTING...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          CONNECT PHANTOM
                        </>
                      )}
                    </button>
                    
                    {!isPhantomInstalled() && (
                      <a
                        href="https://phantom.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 text-white/60 hover:text-white 
                                 font-mono text-[10px] transition-colors tracking-wider border border-white/20 px-4 py-2"
                      >
                        INSTALL PHANTOM WALLET
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* Connected State */
                <div className="space-y-4">
                  {/* Wallet Info */}
                  <div className="p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 font-mono text-xs">CONNECTED WALLET</span>
                      <button
                        onClick={handleDisconnect}
                        className="text-red-400 hover:text-red-300 font-mono text-xs transition-colors"
                      >
                        DISCONNECT
                      </button>
                    </div>
                    <div className="text-white font-mono text-sm break-all">
                      {walletAddress}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-purple-400 font-mono text-xs">
                        {tokens.length} TOKEN{tokens.length !== 1 ? 'S' : ''} FOUND
                      </div>
                      {tokens.length > 0 && !showResults && (
                        <button
                          onClick={handleAnalyzeAll}
                          disabled={analyzingAll}
                          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white font-mono text-xs 
                                   transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {analyzingAll ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              ANALYZING...
                            </>
                          ) : (
                            'ANALYZE ALL'
                          )}
                        </button>
                      )}
                      {showResults && (
                        <button
                          onClick={() => setShowResults(false)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all"
                        >
                          BACK TO LIST
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {loading && (
                    <div className="py-12">
                      <Loader text="Loading tokens..." />
                    </div>
                  )}
                  
                  {error && !loading && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 
                                  font-mono text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {!loading && tokens.length > 0 && !showResults && (
                    <div className="space-y-2">
                      <div className="text-white/60 font-mono text-xs mb-3">
                        Click any token to analyze individually, or use "ANALYZE ALL" for portfolio overview
                      </div>
                      {tokens.map((token) => (
                        <button
                          key={token.address}
                          onClick={() => handleTokenClick(token)}
                          className="w-full p-4 bg-white/5 border border-white/10 hover:border-purple-500/50 
                                   hover:bg-white/10 transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            {token.logoURI ? (
                              <img
                                src={token.logoURI}
                                alt={token.symbol}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 
                                            flex items-center justify-center">
                                <span className="text-purple-400 font-mono text-xs">
                                  {token.symbol.slice(0, 2)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-mono text-sm font-bold">
                                  {token.symbol}
                                </span>
                                <span className="text-white/40 font-mono text-xs">
                                  {token.name}
                                </span>
                              </div>
                              <div className="text-white/60 font-mono text-xs">
                                Balance: {token.uiAmount.toLocaleString(undefined, {
                                  maximumFractionDigits: 6
                                })}
                              </div>
                            </div>
                            
                            <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Bulk Analysis Results */}
                  {showResults && bulkResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="p-4 bg-purple-500/10 border border-purple-500/30 mb-4">
                        <div className="text-white font-mono text-sm mb-2">
                          PORTFOLIO RISK ANALYSIS
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-green-400 font-mono text-2xl font-bold">
                              {bulkResults.filter(r => r.riskScore < 30).length}
                            </div>
                            <div className="text-white/60 font-mono text-xs">LOW</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 font-mono text-2xl font-bold">
                              {bulkResults.filter(r => r.riskScore >= 30 && r.riskScore < 60).length}
                            </div>
                            <div className="text-white/60 font-mono text-xs">MEDIUM</div>
                          </div>
                          <div>
                            <div className="text-orange-400 font-mono text-2xl font-bold">
                              {bulkResults.filter(r => r.riskScore >= 60 && r.riskScore < 80).length}
                            </div>
                            <div className="text-white/60 font-mono text-xs">HIGH</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-mono text-2xl font-bold">
                              {bulkResults.filter(r => r.riskScore >= 80).length}
                            </div>
                            <div className="text-white/60 font-mono text-xs">CRITICAL</div>
                          </div>
                        </div>
                      </div>
                      
                      {bulkResults.map((result) => (
                        <button
                          key={result.address}
                          onClick={() => handleTokenClick(result)}
                          className="w-full p-4 bg-white/5 border border-white/10 hover:border-purple-500/50 
                                   hover:bg-white/10 transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 
                                          flex items-center justify-center">
                              <span className="text-purple-400 font-mono text-xs">
                                {result.symbol.slice(0, 2)}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-mono text-sm font-bold">
                                  {result.symbol}
                                </span>
                                <span className="text-white/40 font-mono text-xs">
                                  {result.name}
                                </span>
                              </div>
                              <div className="text-white/60 font-mono text-xs">
                                Balance: {result.balance.toLocaleString(undefined, {
                                  maximumFractionDigits: 6
                                })}
                              </div>
                            </div>
                            
                            {result.success ? (
                              <div className="text-right">
                                <div className={`font-mono text-2xl font-bold ${getRiskColor(result.riskScore)}`}>
                                  {result.riskScore}
                                </div>
                                <div className={`font-mono text-xs ${getRiskColor(result.riskScore)}`}>
                                  {result.riskLevel}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 font-mono text-xs">
                                FAILED
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
