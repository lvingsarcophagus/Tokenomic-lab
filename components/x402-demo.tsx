/**
 * Demo component showing x402 payment integration
 */

'use client';

import { useState } from 'react';
import { useX402Payment } from '@/hooks/use-x402-payment';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function X402Demo() {
  const { fetchWithPayment, isPaying } = useX402Payment();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePaidRequest = async () => {
    setLoading(true);
    try {
      const data = await fetchWithPayment('/api/premium/paid-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress: '0x1234...', // example
          chain: 'ethereum',
        }),
      });
      setResult(data);
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border border-white/10 rounded-lg bg-black/40">
      <h3 className="text-xl font-semibold">x402 Payment Demo</h3>
      <p className="text-sm text-gray-400">
        This endpoint requires micro-payment (0.01 USDC) to access premium analysis
      </p>

      <Button
        onClick={handlePaidRequest}
        disabled={loading || isPaying}
        className="w-full"
      >
        {loading || isPaying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPaying ? 'Processing Payment...' : 'Loading...'}
          </>
        ) : (
          'Get Premium Analysis (Pay 0.01 USDC)'
        )}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded">
          <h4 className="font-semibold text-green-400 mb-2">Analysis Result:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
