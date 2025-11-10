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
  { id: 501, name: 'Solana', type: 'SOLANA', icon: '☀️', color: 'bg-purple-600' },
];

interface ChainSelectorProps {
  selectedChain: Chain | null;
  onChainSelect: (chain: Chain) => void;
}

export default function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {/* Selected Chain Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 min-w-[200px]"
      >
        <span className="text-2xl">{selectedChain?.icon || '⛓️'}</span>
        <div className="flex-1 text-left">
          <div className="text-xs text-gray-400">Chain</div>
          <div className="text-white font-semibold">
            {selectedChain?.name || 'Select Network'}
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-lg z-20 overflow-hidden shadow-xl">
            {SUPPORTED_CHAINS.map(chain => (
              <button
                key={chain.id}
                onClick={() => {
                  onChainSelect(chain);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-150"
              >
                <span className="text-2xl">{chain.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{chain.name}</div>
                  <div className="text-xs text-gray-400">{chain.type}</div>
                </div>
                {selectedChain?.id === chain.id && (
                  <div className={`w-2 h-2 ${chain.color} rounded-full animate-pulse`} />
                )}
              </button>
            ))}
            
            {/* Coming Soon Section */}
            <div className="border-t border-white/10 px-4 py-2 bg-white/5">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>⏳</span>
                <span>More chains coming soon: Cardano, Arbitrum, Base</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact chain badge component for displaying selected chain
 */
export function ChainBadge({ chain }: { chain: Chain }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
      <span className="text-lg">{chain.icon}</span>
      <span className="text-sm font-medium text-white">{chain.name}</span>
      <span className="text-xs text-gray-400 hidden sm:inline">{chain.type}</span>
    </div>
  );
}

/**
 * Get chain by ID
 */
export function getChainById(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
}

/**
 * Get chain name for display
 */
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || 'Unknown Chain';
}
