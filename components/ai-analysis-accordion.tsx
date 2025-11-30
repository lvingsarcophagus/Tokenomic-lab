'use client';

import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, TrendingUp, Zap, Target } from 'lucide-react';
import type { RiskResult } from '@/lib/types/token-data';

interface AIAnalysisAccordionProps {
  aiSummary: RiskResult['ai_summary'];
  tokenName: string;
  riskLevel: string;
}

export default function AIAnalysisAccordion({
  aiSummary,
  tokenName,
  riskLevel,
}: AIAnalysisAccordionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!aiSummary) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return 'from-red-900/20 to-red-900/5 border-red-500/30';
      case 'HIGH':
        return 'from-orange-900/20 to-orange-900/5 border-orange-500/30';
      case 'MEDIUM':
        return 'from-yellow-900/20 to-yellow-900/5 border-yellow-500/30';
      case 'LOW':
        return 'from-green-900/20 to-green-900/5 border-green-500/30';
      default:
        return 'from-gray-900/20 to-gray-900/5 border-gray-500/30';
    }
  };

  const getRecommendationColor = (rec: string) => {
    const recLower = rec.toLowerCase();
    if (recLower.includes('avoid') || recLower.includes('high risk') || recLower.includes('caution')) {
      return 'text-red-400 bg-red-400/10 border border-red-500/30';
    }
    if (recLower.includes('research') || recLower.includes('moderate')) {
      return 'text-yellow-400 bg-yellow-400/10 border border-yellow-500/30';
    }
    if (recLower.includes('safe') || recLower.includes('low risk') || recLower.includes('proceed')) {
      return 'text-green-400 bg-green-400/10 border border-green-500/30';
    }
    return 'text-gray-400 bg-gray-400/10 border border-gray-500/30';
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden bg-gradient-to-br ${getRiskColor(
        riskLevel
      )} mb-4`}
    >
      {/* Header - Collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div className="text-left">
            <h3 className="text-gray-200 font-mono text-sm font-bold tracking-wider">
              AI ANALYSIS
            </h3>
            <p className="text-gray-400 font-mono text-xs mt-1 line-clamp-1">
              {aiSummary.overview?.substring(0, 50) || 'AI analysis available'}...
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'transform rotate-180' : ''
            }`}
        />
      </button>

      {/* Expandable Content */}
      {expanded && (
        <div className="border-t border-white/10 bg-black/40">
          <div className="p-4 space-y-6">
            {/* Overview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-gray-400" />
                <h4 className="text-gray-300 font-mono text-xs font-bold tracking-wider">
                  OVERVIEW
                </h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed pl-6">
                {aiSummary.overview}
              </p>
            </div>

            {/* Risk Analysis */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <h4 className="text-gray-300 font-mono text-xs font-bold tracking-wider">
                  RISK ANALYSIS
                </h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed pl-6">
                {aiSummary.riskAnalysis}
              </p>
            </div>

            {/* Key Insights */}
            {aiSummary.keyInsights && aiSummary.keyInsights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-gray-400" />
                  <h4 className="text-gray-300 font-mono text-xs font-bold tracking-wider">
                    KEY INSIGHTS
                  </h4>
                </div>
                <ul className="space-y-2 pl-6">
                  {aiSummary.keyInsights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="text-gray-300 text-xs flex gap-2 leading-relaxed"
                    >
                      <span className="text-gray-500 font-mono">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <h4 className="text-gray-300 font-mono text-xs font-bold tracking-wider">
                  RECOMMENDATION
                </h4>
              </div>
              <div className={`pl-6 inline-block px-3 py-2 rounded text-sm font-mono ${getRecommendationColor(aiSummary.recommendation)}`}>
                {aiSummary.recommendation}
              </div>
            </div>

            {/* Calculation Breakdown */}
            {aiSummary.calculationBreakdown && (
              <div className="pt-3 border-t border-white/10">
                <h4 className="text-gray-300 font-mono text-xs font-bold tracking-wider mb-3 uppercase">
                  📊 CALCULATION BREAKDOWN
                </h4>
                <div className="bg-black/40 p-4 rounded border border-white/10">
                  <pre className="text-gray-300 font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                    {aiSummary.calculationBreakdown}
                  </pre>
                </div>
              </div>
            )}

            {/* Technical Details */}
            {aiSummary.technicalDetails && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-gray-400 font-mono text-xs leading-relaxed">
                  {aiSummary.technicalDetails}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
