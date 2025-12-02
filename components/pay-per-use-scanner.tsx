/**
 * Pay-Per-Use Token Scanner
 * Allows anonymous users to scan tokens by paying per scan
 */

'use client';

import { useState } from 'react';
import { useX402Payment } from '@/hooks/use-x402-payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Coins, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

const CHAINS = [
  { id: '1', name: 'Ethereum', symbol: 'ETH' },
  { id: '56', name: 'BSC', symbol: 'BNB' },
  { id: '137', name: 'Polygon', symbol: 'MATIC' },
  { id: '501', name: 'Solana', symbol: 'SOL' },
];

export function PayPerUseScanner() {
  const { fetchWithPayment, isPaying } = useX402Payment();
  const [tokenAddress, setTokenAddress] = useState('');
  const [chainId, setChainId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!tokenAddress) {
      toast.error('Please enter a token address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await fetchWithPayment('/api/analyze-token-payperuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress,
          chainId,
          metadata: {
            tokenName: 'Unknown',
            tokenSymbol: 'TOKEN',
          },
        }),
      });

      setResult(data);
      toast.success('Analysis complete!');
    } catch (error: any) {
      console.error('Scan failed:', error);
      toast.error(error.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-400';
    if (score <= 60) return 'text-yellow-400';
    if (score <= 80) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Pay-Per-Use Scanner</h2>
        </div>
        <p className="text-sm text-gray-400">
          No signup required • Pay only $0.05 per scan • Instant results
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4 p-6 border border-white/10 rounded-lg bg-black/40 backdrop-blur-sm">
        <div className="space-y-2">
          <Label htmlFor="token-address">Token Address</Label>
          <Input
            id="token-address"
            placeholder="0x... or token address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="bg-black/60 border-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chain">Blockchain</Label>
          <select
            id="chain"
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-md text-white"
          >
            {CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.symbol})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleScan}
          disabled={loading || isPaying || !tokenAddress}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading || isPaying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPaying ? 'Processing Payment...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Scan Token (Pay 0.05 USDC)
            </>
          )}
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-white/10 rounded-lg bg-black/20">
          <Shield className="h-5 w-5 text-green-400 mb-2" />
          <h3 className="font-semibold text-sm">Premium Analysis</h3>
          <p className="text-xs text-gray-400 mt-1">
            Full AI-powered risk assessment with all premium features
          </p>
        </div>
        <div className="p-4 border border-white/10 rounded-lg bg-black/20">
          <Coins className="h-5 w-5 text-blue-400 mb-2" />
          <h3 className="font-semibold text-sm">No Subscription</h3>
          <p className="text-xs text-gray-400 mt-1">
            Pay only for what you use, no monthly commitment
          </p>
        </div>
        <div className="p-4 border border-white/10 rounded-lg bg-black/20">
          <Zap className="h-5 w-5 text-yellow-400 mb-2" />
          <h3 className="font-semibold text-sm">Instant Access</h3>
          <p className="text-xs text-gray-400 mt-1">
            Connect wallet, pay, and get results in seconds
          </p>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 p-6 border border-white/10 rounded-lg bg-black/40">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Analysis Results</h3>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getRiskColor(result.overall_risk_score)}`}>
                {result.overall_risk_score}/100
              </div>
              <div className="text-sm text-gray-400">{result.risk_level} RISK</div>
            </div>
          </div>

          {/* AI Summary */}
          {result.ai_summary && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
              <h4 className="font-semibold text-blue-400 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-300">{result.ai_summary}</p>
            </div>
          )}

          {/* Critical Flags */}
          {result.critical_flags && result.critical_flags.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded">
              <h4 className="font-semibold text-red-400 mb-2">⚠️ Critical Flags</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {result.critical_flags.map((flag: string, i: number) => (
                  <li key={i}>• {flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Market Data */}
          {result.raw_data && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400">Market Cap</div>
                <div className="text-lg font-semibold">
                  ${(result.raw_data.marketCap / 1e6).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Liquidity</div>
                <div className="text-lg font-semibold">
                  ${(result.raw_data.liquidityUSD / 1e3).toFixed(2)}K
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Holders</div>
                <div className="text-lg font-semibold">
                  {result.raw_data.holderCount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Top 10 Concentration</div>
                <div className="text-lg font-semibold">
                  {(result.raw_data.top10HoldersPct * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Prompt */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded text-center">
            <p className="text-sm text-gray-300 mb-2">
              Want unlimited scans and advanced features?
            </p>
            <Button
              onClick={() => (window.location.href = '/pricing')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Upgrade to Premium
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
