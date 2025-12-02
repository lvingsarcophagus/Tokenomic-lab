/**
 * Payment Confirmation Modal
 * Styled to match the app's monochrome glassmorphism theme
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, Wallet, X } from 'lucide-react';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onConfirm: (selectedAsset: 'SOL' | 'USDC') => void;
  onCancel: () => void;
  price: string;
  asset: string;
  chain: string;
  solBalance: number;
  usdcBalance: number;
}

export function PaymentConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  price,
  asset,
  chain,
  solBalance,
  usdcBalance,
}: PaymentConfirmationModalProps) {
  const [selectedAsset, setSelectedAsset] = useState<'SOL' | 'USDC'>(asset as 'SOL' | 'USDC');
  
  if (!isOpen) return null;

  const balance = selectedAsset === 'SOL' ? solBalance : usdcBalance;
  const hasEnough = balance >= parseFloat(price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-black border border-white/20 backdrop-blur-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-mono tracking-wider">
              PAYMENT REQUIRED
            </h3>
            <button
              onClick={onCancel}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Asset Selector */}
          <div>
            <p className="text-xs text-gray-400 font-mono mb-2">SELECT PAYMENT METHOD</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedAsset('SOL')}
                className={`px-4 py-3 border rounded font-mono text-sm transition-all ${
                  selectedAsset === 'SOL'
                    ? 'bg-white text-black border-white'
                    : 'border-white/20 text-white hover:border-white/40'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">SOL</div>
                  <div className="text-xs opacity-60">
                    {solBalance.toFixed(4)} available
                  </div>
                </div>
              </button>
              <button
                onClick={() => setSelectedAsset('USDC')}
                className={`px-4 py-3 border rounded font-mono text-sm transition-all ${
                  selectedAsset === 'USDC'
                    ? 'bg-white text-black border-white'
                    : 'border-white/20 text-white hover:border-white/40'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">USDC</div>
                  <div className="text-xs opacity-60">
                    {usdcBalance.toFixed(2)} available
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="bg-white/5 border border-white/10 p-4 rounded">
            <p className="text-xs text-gray-400 font-mono mb-2">PAYMENT AMOUNT</p>
            <p className="text-3xl font-bold text-white font-mono">
              {price} {selectedAsset}
            </p>
            <p className="text-xs text-gray-500 font-mono mt-1">on {chain}</p>
          </div>

          {/* Balance Display */}
          <div className="bg-white/5 border border-white/10 p-4 rounded">
            <p className="text-xs text-gray-400 font-mono mb-2">YOUR {selectedAsset} BALANCE</p>
            <p className={`text-xl font-bold font-mono ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
              {balance.toFixed(selectedAsset === 'USDC' ? 2 : 4)} {selectedAsset}
            </p>
          </div>

          {/* Insufficient Funds Warning */}
          {!hasEnough && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-400 font-mono mb-2">
                    ⚠️ INSUFFICIENT FUNDS
                  </p>
                  <p className="text-xs text-red-400 font-mono mb-3">
                    You need {price} {selectedAsset} but only have {balance.toFixed(selectedAsset === 'USDC' ? 2 : 4)} {selectedAsset}.
                  </p>
                  
                  {selectedAsset === 'USDC' ? (
                    <div className="text-xs text-gray-400 font-mono space-y-1">
                      <p className="text-white font-bold mb-1">To get USDC:</p>
                      <p>1. Buy USDC on an exchange (Coinbase, Binance)</p>
                      <p>2. Send to your Phantom wallet</p>
                      <p>3. Try selecting SOL if you have it</p>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 font-mono space-y-1">
                      <p className="text-white font-bold mb-1">To get SOL:</p>
                      <p>1. Buy SOL on an exchange</p>
                      <p>2. Send to your Phantom wallet</p>
                      <p>3. Or try selecting USDC if you have it</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Info */}
          {hasEnough && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded">
              <p className="text-xs text-green-400 font-mono">
                ✓ Sufficient {selectedAsset} balance available
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-white/20 text-white rounded font-mono text-sm hover:bg-white/5 transition-all"
          >
            CANCEL
          </button>
          {hasEnough && (
            <button
              onClick={() => onConfirm(selectedAsset)}
              className="flex-1 px-4 py-3 bg-white text-black rounded font-mono text-sm hover:bg-white/90 transition-all font-bold flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              PAY WITH {selectedAsset}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
