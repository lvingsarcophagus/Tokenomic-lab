'use client'

/**
 * Algorithm Efficiency Tester
 * Tests the risk calculation algorithm with multiple tokens
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BarChart3, Play, Download, AlertCircle } from 'lucide-react'

interface TestResult {
  token: string
  address: string
  expectedRange: string
  actualScore: number
  individualScores: any
  tokenData: any
  variance: number
  pass: boolean
  timestamp: string
}

const TEST_TOKENS = [
  {
    name: 'USDT (Low Risk)',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    expectedMin: 15,
    expectedMax: 30
  },
  {
    name: 'USDC (Low Risk)',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    expectedMin: 15,
    expectedMax: 30
  },
  {
    name: 'WETH (Low Risk)',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    expectedMin: 15,
    expectedMax: 30
  },
  {
    name: 'SHIB (Medium Risk)',
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    expectedMin: 25,
    expectedMax: 40
  },
  {
    name: 'PEPE (Medium Risk)',
    address: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    expectedMin: 25,
    expectedMax: 40
  }
]

export default function AlgorithmTester() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)
  const [currentToken, setCurrentToken] = useState('')
  const [customAddress, setCustomAddress] = useState('')

  const testToken = async (address: string, expectedMin: number, expectedMax: number, name: string) => {
    try {
      setCurrentToken(name)
      
      // Call the analyze-token API which performs the full analysis
      const response = await fetch('/api/analyze-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress: address,
          chainId: '1', // Ethereum mainnet
          userId: 'algorithm-tester',
          plan: 'PREMIUM' // Use PREMIUM to get full data
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Failed to test ${name}:`, errorData)
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data = await response.json()
      
      console.log(`[Test] Response for ${name}:`, data)
      
      // Extract the overall risk score from the response
      const actualScore = data.overall_risk_score || 0
      const breakdown = data.breakdown || {}
      
      const variance = actualScore >= expectedMin && actualScore <= expectedMax ? 0 : 
                      Math.min(Math.abs(actualScore - expectedMin), Math.abs(actualScore - expectedMax))
      
      const result: TestResult = {
        token: name,
        address,
        expectedRange: `${expectedMin}-${expectedMax}`,
        actualScore,
        individualScores: breakdown,
        tokenData: data,
        variance,
        pass: actualScore >= expectedMin && actualScore <= expectedMax,
        timestamp: new Date().toISOString()
      }

      setResults(prev => [...prev, result])
      
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      return result
    } catch (error) {
      console.error(`Failed to test ${name}:`, error)
      
      // Add failed result
      const failedResult: TestResult = {
        token: name,
        address,
        expectedRange: `${expectedMin}-${expectedMax}`,
        actualScore: 0,
        individualScores: { error: String(error) },
        tokenData: {},
        variance: expectedMin,
        pass: false,
        timestamp: new Date().toISOString()
      }
      setResults(prev => [...prev, failedResult])
      
      return null
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])
    
    for (const token of TEST_TOKENS) {
      await testToken(token.address, token.expectedMin, token.expectedMax, token.name)
    }
    
    setTesting(false)
    setCurrentToken('')
  }

  const testCustomToken = async () => {
    if (!customAddress.trim()) return
    
    setTesting(true)
    await testToken(customAddress, 0, 100, 'Custom Token')
    setTesting(false)
    setCustomAddress('')
  }

  const exportResults = () => {
    const csv = [
      ['Token', 'Address', 'Expected Range', 'Actual Score', 'Variance', 'Pass/Fail', 'Timestamp'],
      ...results.map(r => [
        r.token,
        r.address,
        r.expectedRange,
        r.actualScore.toString(),
        r.variance.toString(),
        r.pass ? 'PASS' : 'FAIL',
        r.timestamp
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `algorithm-test-${Date.now()}.csv`
    a.click()
  }

  const passRate = results.length > 0 
    ? (results.filter(r => r.pass).length / results.length * 100).toFixed(1)
    : '0'

  const avgVariance = results.length > 0
    ? (results.reduce((sum, r) => sum + r.variance, 0) / results.length).toFixed(2)
    : '0'

  const scoreRange = results.length > 0
    ? {
        min: Math.min(...results.map(r => r.actualScore)),
        max: Math.max(...results.map(r => r.actualScore))
      }
    : { min: 0, max: 0 }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 p-6 mb-6">
          <h1 className="text-3xl font-bold text-white font-mono mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            ALGORITHM EFFICIENCY TESTER
          </h1>
          <p className="text-white/70 text-sm font-mono">
            Test the risk calculation algorithm across multiple token types and analyze variance
          </p>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-black/60 border-white/20 p-6">
            <h2 className="text-white font-mono font-bold mb-4">Run Tests</h2>
            <div className="space-y-4">
              <Button
                onClick={runAllTests}
                disabled={testing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-mono"
              >
                <Play className="w-4 h-4 mr-2" />
                {testing ? `Testing ${currentToken}...` : `Run All Tests (${TEST_TOKENS.length} tokens)`}
              </Button>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Custom token address..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  disabled={testing}
                  className="flex-1 bg-black/50 border-white/20 text-white font-mono"
                />
                <Button
                  onClick={testCustomToken}
                  disabled={testing || !customAddress.trim()}
                  variant="outline"
                  className="border-white/20 font-mono"
                >
                  Test
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-black/60 border-white/20 p-6">
            <h2 className="text-white font-mono font-bold mb-4">Results Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                <span className="text-white/60 text-sm font-mono">Tests Run:</span>
                <span className="text-white font-mono font-bold">{results.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                <span className="text-white/60 text-sm font-mono">Pass Rate:</span>
                <span className={`font-mono font-bold ${parseFloat(passRate) >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                  {passRate}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                <span className="text-white/60 text-sm font-mono">Avg Variance:</span>
                <span className="text-white font-mono font-bold">{avgVariance}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                <span className="text-white/60 text-sm font-mono">Score Range:</span>
                <span className="text-white font-mono font-bold">
                  {scoreRange.min} - {scoreRange.max}
                </span>
              </div>
              <Button
                onClick={exportResults}
                disabled={results.length === 0}
                variant="outline"
                className="w-full border-white/20 font-mono mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results (CSV)
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <Card className="bg-black/60 border-white/20 p-6">
            <h2 className="text-white font-mono font-bold mb-4">Test Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-white/60 text-xs font-mono">TOKEN</th>
                    <th className="text-left p-3 text-white/60 text-xs font-mono">EXPECTED</th>
                    <th className="text-left p-3 text-white/60 text-xs font-mono">ACTUAL</th>
                    <th className="text-left p-3 text-white/60 text-xs font-mono">VARIANCE</th>
                    <th className="text-left p-3 text-white/60 text-xs font-mono">STATUS</th>
                    <th className="text-left p-3 text-white/60 text-xs font-mono">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        <div>
                          <p className="text-white font-mono font-bold text-sm">{result.token}</p>
                          <p className="text-white/40 text-xs font-mono">
                            {result.address.substring(0, 10)}...
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-white/80 font-mono text-sm">{result.expectedRange}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded font-mono font-bold text-sm ${
                          result.actualScore < 30 ? 'bg-green-500/20 text-green-400' :
                          result.actualScore < 55 ? 'bg-yellow-500/20 text-yellow-400' :
                          result.actualScore < 75 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {result.actualScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-white/80 font-mono text-sm">
                          {result.variance.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded font-mono font-bold text-xs ${
                          result.pass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {result.pass ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </td>
                      <td className="p-3">
                        <details className="cursor-pointer">
                          <summary className="text-blue-400 hover:text-blue-300 text-xs font-mono">
                            View Breakdown
                          </summary>
                          <div className="mt-2 p-3 bg-black/50 rounded text-xs font-mono space-y-1">
                            {Object.entries(result.individualScores).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-white/60">{key}:</span>
                                <span className="text-white">
                                  {typeof value === 'number' ? value.toFixed(1) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Algorithm Health Indicator */}
        {results.length >= 3 && (
          <Card className={`mt-6 p-6 border-2 ${
            parseFloat(passRate) >= 80 && (scoreRange.max - scoreRange.min) > 20
              ? 'bg-green-500/10 border-green-500'
              : 'bg-red-500/10 border-red-500'
          }`}>
            <div className="flex items-start gap-4">
              <AlertCircle className={`w-8 h-8 mt-1 ${
                parseFloat(passRate) >= 80 && (scoreRange.max - scoreRange.min) > 20
                  ? 'text-green-400'
                  : 'text-red-400'
              }`} />
              <div>
                <h3 className={`font-mono font-bold text-lg mb-2 ${
                  parseFloat(passRate) >= 80 && (scoreRange.max - scoreRange.min) > 20
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {parseFloat(passRate) >= 80 && (scoreRange.max - scoreRange.min) > 20
                    ? '✓ Algorithm is Working Efficiently'
                    : '⚠ Algorithm May Need Adjustment'}
                </h3>
                <ul className="text-white/80 text-sm space-y-1 font-mono">
                  <li>• Pass Rate: {passRate}% {parseFloat(passRate) >= 80 ? '✓' : '✗'}</li>
                  <li>• Score Range: {(scoreRange.max - scoreRange.min).toFixed(1)} points {(scoreRange.max - scoreRange.min) > 20 ? '✓' : '✗'}</li>
                  <li>• Average Variance: {avgVariance} points</li>
                  <li>• Tests Completed: {results.length}/{TEST_TOKENS.length}</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
