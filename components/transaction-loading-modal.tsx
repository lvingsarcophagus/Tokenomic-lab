/**
 * Transaction Loading Modal
 * Animated loading screen for blockchain transactions
 */

'use client';

import { NetworkSolana, TokenUSDC } from '@web3icons/react';
import { Loader2 } from 'lucide-react';

interface TransactionLoadingModalProps {
  isOpen: boolean;
  asset: string;
  amount: string;
  status: 'connecting' | 'signing' | 'confirming' | 'success';
}

export function TransactionLoadingModal({
  isOpen,
  asset,
  amount,
  status,
}: TransactionLoadingModalProps) {
  if (!isOpen) return null;

  const statusMessages = {
    connecting: 'Connecting to wallet...',
    signing: 'Please sign the transaction in your wallet',
    confirming: 'Confirming transaction on blockchain...',
    success: 'Transaction confirmed!',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="relative bg-black border-2 border-white/20 backdrop-blur-xl max-w-md w-full p-8">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/40"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/40"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/40"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/40"></div>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative flex items-center justify-center h-32">
            {/* Rotating outer ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            
            {/* Pulsing middle ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border border-white/10 rounded-full animate-pulse"></div>
            </div>

            {/* Asset Icon */}
            <div className="relative z-10 flex items-center justify-center">
              {asset === 'SOL' ? (
                <NetworkSolana size={48} variant="mono" className="text-white animate-pulse" />
              ) : (
                <TokenUSDC size={48} variant="mono" className="text-white animate-pulse" />
              )}
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
              <div className="w-28 h-28 relative">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2"></div>
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-white/40 rounded-full -translate-y-1/2"></div>
                <div className="absolute right-0 top-1/2 w-2 h-2 bg-white/20 rounded-full -translate-y-1/2"></div>
              </div>
            </div>
          </div>

          {/* Transaction Amount */}
          <div className="border border-white/20 p-4 bg-white/5">
            <p className="text-xs text-white/60 font-mono mb-1 uppercase tracking-wider">
              Transaction Amount
            </p>
            <p className="text-2xl font-bold text-white font-mono">
              {amount} {asset}
            </p>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <p className="text-sm text-white font-mono font-bold uppercase tracking-wider">
              {statusMessages[status]}
            </p>
            
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    opacity: status === 'success' ? 1 : 0.4,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Status Steps */}
          <div className="border-t border-white/10 pt-4">
            <div className="space-y-2">
              {[
                { key: 'connecting', label: 'Connect Wallet' },
                { key: 'signing', label: 'Sign Transaction' },
                { key: 'confirming', label: 'Confirm on Chain' },
              ].map((step, i) => {
                const isActive = status === step.key;
                const isComplete = ['connecting', 'signing', 'confirming', 'success'].indexOf(status) > i;
                
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-5 h-5 border flex items-center justify-center ${
                      isComplete ? 'border-white bg-white' : isActive ? 'border-white' : 'border-white/20'
                    }`}>
                      {isComplete && (
                        <span className="text-black text-xs">✓</span>
                      )}
                      {isActive && !isComplete && (
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                      )}
                    </div>
                    <p className={`text-xs font-mono ${
                      isComplete || isActive ? 'text-white' : 'text-white/40'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning */}
          {status === 'signing' && (
            <div className="border border-white/20 p-3 bg-white/5">
              <p className="text-xs text-white/60 font-mono">
                ⚠ Do not close this window or refresh the page
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
