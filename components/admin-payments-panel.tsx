/**
 * Admin panel for monitoring x402 payments
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, DollarSign, Users, TrendingUp, Settings, RefreshCw, CreditCard, Wallet, BarChart3, PieChart as PieChartIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminPaymentsPanel() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [useTestnet, setUseTestnet] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState('29.00');
  const [selectedAsset, setSelectedAsset] = useState<'SOL' | 'USDC'>('USDC');

  const fetchPayments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/payments?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch payments');

      const data = await response.json();
      setPayments(data.subscriptions || []);
      setStats(data.stats || {});
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payments');
    }
  };

  const fetchSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/x402-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data.settings || {});
      setUseTestnet(data.settings?.useTestnet || false);
      setSelectedAsset(data.settings?.useTestnet ? 'SOL' : 'USDC');
      setNewPrice(data.settings?.price || '29.00');
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const toggleTestnet = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newTestnetValue = !useTestnet;
      const newAsset = newTestnetValue ? 'SOL' : 'USDC';

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/x402-settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useTestnet: newTestnetValue,
          recipientAddress: settings?.recipientAddress,
          price: settings?.price,
          asset: newAsset,
        }),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      setUseTestnet(newTestnetValue);
      setSelectedAsset(newAsset);
      toast.success(`Switched to ${newTestnetValue ? 'TESTNET' : 'MAINNET'} mode`);
    } catch (error: any) {
      console.error('Failed to toggle testnet:', error);
      toast.error('Failed to update settings');
    }
  };

  const updatePrice = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/x402-settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useTestnet,
          recipientAddress: settings?.recipientAddress,
          price: newPrice,
          asset: selectedAsset,
        }),
      });

      if (!response.ok) throw new Error('Failed to update price');

      setShowPriceModal(false);
      toast.success('Price updated successfully');
      await fetchSettings();
    } catch (error: any) {
      console.error('Failed to update price:', error);
      toast.error('Failed to update price');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPayments(), fetchSettings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-white/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-mono tracking-wider">PAYMENTS</h2>
            <p className="text-white/50 text-xs font-mono mt-0.5">x402 Protocol Monitoring</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleTestnet}
            className={`px-4 py-2 border-2 font-mono text-xs transition-all ${
              useTestnet 
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' 
                : 'border-green-500/50 bg-green-500/10 text-green-400'
            }`}
          >
            <Settings className="w-3 h-3 inline mr-2" />
            {useTestnet ? 'TESTNET' : 'MAINNET'}
          </button>
          <button
            onClick={() => setShowPriceModal(true)}
            className="px-4 py-2 border-2 border-white/20 text-white hover:bg-white/5 font-mono text-xs transition-all"
          >
            <DollarSign className="w-3 h-3 inline mr-2" />
            CONFIGURE
          </button>
          <button
            onClick={() => fetchPayments()}
            className="px-4 py-2 border-2 border-white/20 text-white hover:bg-white/5 font-mono text-xs transition-all"
          >
            <RefreshCw className="w-3 h-3 inline mr-2" />
            REFRESH
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-400 text-xs font-mono uppercase tracking-wider">Revenue</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono mb-1">
            ${stats?.totalRevenue || '0.00'}
          </div>
          <div className="text-white/40 text-xs font-mono">Total earned</div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-400 text-xs font-mono uppercase tracking-wider">Active</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono mb-1">
            {stats?.active || 0}
          </div>
          <div className="text-white/40 text-xs font-mono">Subscriptions</div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-purple-400 text-xs font-mono uppercase tracking-wider">Total</span>
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono mb-1">
            {stats?.total || 0}
          </div>
          <div className="text-white/40 text-xs font-mono">All payments</div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-yellow-400 text-xs font-mono uppercase tracking-wider">Average</span>
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono mb-1">
            ${stats?.total > 0 ? (stats.totalRevenue / stats.total).toFixed(2) : '0.00'}
          </div>
          <div className="text-white/40 text-xs font-mono">Per payment</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-white" />
            <h3 className="text-white font-mono text-sm font-bold tracking-wider">REVENUE TREND</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={payments.slice(0, 10).reverse().map((p, i) => ({
              date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              revenue: parseFloat(p.amount) || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff60" 
                style={{ fontSize: '10px', fontFamily: 'monospace' }} 
              />
              <YAxis 
                stroke="#ffffff60" 
                style={{ fontSize: '10px', fontFamily: 'monospace' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid #ffffff20', 
                  borderRadius: '0px',
                  fontFamily: 'monospace'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ fill: '#10b981', r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-white" />
            <h3 className="text-white font-mono text-sm font-bold tracking-wider">STATUS DISTRIBUTION</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Active', value: stats?.active || 0, color: '#10b981' },
                  { name: 'Expired', value: (stats?.total || 0) - (stats?.active || 0), color: '#6b7280' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Active', value: stats?.active || 0, color: '#10b981' },
                  { name: 'Expired', value: (stats?.total || 0) - (stats?.active || 0), color: '#6b7280' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid #ffffff20', 
                  borderRadius: '0px',
                  fontFamily: 'monospace'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-black/60 backdrop-blur-lg border border-white/20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-white" />
            <h3 className="text-white font-mono text-sm font-bold tracking-wider">RECENT TRANSACTIONS</h3>
          </div>
        </div>
        
        <div className="p-6">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 font-mono text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase tracking-wider">Chain</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-3 text-white/60 font-mono text-xs uppercase tracking-wider">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-3">
                        <div className="text-white font-mono text-xs font-bold">
                          {payment.userName || 'Unknown'}
                        </div>
                        <div className="text-white/40 text-xs font-mono">{payment.userEmail}</div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-white font-mono text-sm font-bold">
                          {payment.amount} {payment.asset}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-white/60 font-mono uppercase text-xs">
                          {payment.chain}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-1 border text-xs font-mono font-bold ${
                            payment.status === 'active'
                              ? 'border-green-500/50 bg-green-500/10 text-green-400'
                              : 'border-white/20 bg-white/5 text-white/40'
                          }`}
                        >
                          {payment.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-white/60 text-xs font-mono">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-3">
                        <a
                          href={`https://solscan.io/tx/${payment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs font-mono inline-flex items-center gap-1 transition-colors"
                        >
                          {payment.txHash?.substring(0, 8)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Price Configuration Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border-2 border-white/20 p-8 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-white/30 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white font-mono tracking-wider">PRICING CONFIG</h3>
            </div>
            
            <div className="space-y-6">
              {/* Asset Selector */}
              <div>
                <label className="text-white/60 text-xs font-mono mb-3 block uppercase tracking-wider">
                  Payment Asset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedAsset('SOL');
                      if (!useTestnet) toggleTestnet();
                    }}
                    className={`px-4 py-4 border-2 font-mono text-sm transition-all ${
                      selectedAsset === 'SOL'
                        ? 'bg-white text-black border-white'
                        : 'border-white/20 text-white hover:border-white/40'
                    }`}
                  >
                    <div className="font-bold">SOL</div>
                    <div className="text-xs opacity-60">Testnet</div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAsset('USDC');
                      if (useTestnet) toggleTestnet();
                    }}
                    className={`px-4 py-4 border-2 font-mono text-sm transition-all ${
                      selectedAsset === 'USDC'
                        ? 'bg-white text-black border-white'
                        : 'border-white/20 text-white hover:border-white/40'
                    }`}
                  >
                    <div className="font-bold">USDC</div>
                    <div className="text-xs opacity-60">Mainnet</div>
                  </button>
                </div>
              </div>

              {/* Price Input */}
              <div>
                <label className="text-white/60 text-xs font-mono mb-3 block uppercase tracking-wider">
                  Price Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-4 bg-black/60 border-2 border-white/20 text-white font-mono text-xl focus:outline-none focus:border-white/40"
                    placeholder={selectedAsset === 'SOL' ? '0.01' : '29.00'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-mono font-bold">
                    {selectedAsset}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-400 font-mono leading-relaxed">
                  {selectedAsset === 'SOL' 
                    ? '💡 Testnet mode uses Solana devnet. Users can get free SOL from faucets for testing.'
                    : '💰 Mainnet mode charges real USDC on Solana mainnet. This is production-ready.'}
                </p>
              </div>

              {/* Current Settings */}
              <div className="p-4 bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 font-mono mb-2 uppercase tracking-wider">Current Config</p>
                <p className="text-lg text-white font-mono font-bold">
                  {settings?.price || '29.00'} {useTestnet ? 'SOL' : 'USDC'}
                </p>
                <p className="text-xs text-white/40 font-mono mt-1">
                  {useTestnet ? 'Testnet Mode' : 'Mainnet Mode'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={updatePrice}
                  className="flex-1 px-6 py-4 bg-white text-black border-2 border-white font-mono text-sm hover:bg-transparent hover:text-white transition-all font-bold tracking-wider"
                >
                  SAVE CHANGES
                </button>
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-white/20 text-white font-mono text-sm hover:bg-white/5 transition-all tracking-wider"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
