'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Chain {
  id: number;
  name: string;
  type: 'EVM' | 'SOLANA' | 'CARDANO';
  icon: string;
  color: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: 'Ethereum', type: 'EVM', icon: '⚡', color: 'bg-blue-500' },
  { id: 56, name: 'BNB Chain', type: 'EVM', icon: '🟡', color: 'bg-yellow-500' },
  { id: 137, name: 'Polygon', type: 'EVM', icon: '🟣', color: 'bg-purple-500' },
  { id: 43114, name: 'Avalanche', type: 'EVM', icon: '🔺', color: 'bg-red-500' },
  { id: 250, name: 'Fantom', type: 'EVM', icon: '👻', color: 'bg-blue-400' },
  { id: 42161, name: 'Arbitrum', type: 'EVM', icon: '🔵', color: 'bg-blue-600' },
  { id: 10, name: 'Optimism', type: 'EVM', icon: '🔴', color: 'bg-red-600' },
  { id: 8453, name: 'Base', type: 'EVM', icon: '🔷', color: 'bg-blue-700' },
  { id: 501, name: 'Solana', type: 'SOLANA', icon: '☀️', color: 'bg-purple-600' },
  { id: 1815, name: 'Cardano', type: 'CARDANO', icon: '🔷', color: 'bg-blue-800' },
];

interface ChainSelectorProps {
  selectedChain: Chain | null;
  onChainSelect: (chain: Chain) => void;
}

export default function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-black/60 border border-white/20 hover:bg-black/80 transition-colors w-full"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{selectedChain?.icon || '⛓️'}</span>
          <div className="text-left">
            <div className="text-[10px] text-white/40 font-mono tracking-wider">SELECT CHAIN</div>
            <div className="text-white font-mono text-sm tracking-wider">
              {selectedChain?.name || 'CHOOSE NETWORK'}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/20 shadow-2xl z-20 max-h-96 overflow-y-auto">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onChainSelect(chain);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0"
              >
                <span className="text-2xl">{chain.icon}</span>
                <div className="flex-1">
                  <div className="text-white font-mono text-sm tracking-wider">{chain.name}</div>
                  <div className="text-[10px] text-white/40 font-mono tracking-wider">{chain.type}</div>
                </div>
                {selectedChain?.id === chain.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
