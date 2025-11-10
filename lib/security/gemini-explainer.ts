/**
 * Gemini AI Integration for Risk Explanation
 * Generates plain English explanations of security analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChainType, type SecurityCheck } from './chain-adapters';

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Generate AI-powered risk explanation
 */
export async function generateAIExplanation(
  tokenName: string,
  chainName: string,
  chainType: ChainType,
  riskScore: number,
  riskLevel: string,
  securityChecks: SecurityCheck[]
): Promise<string> {
  
  const ai = getGenAI();
  if (!ai) {
    console.log('[Gemini AI] No API key configured, using fallback explanation');
    return generateFallbackExplanation(tokenName, chainName, riskScore, riskLevel, securityChecks);
  }
  
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,  // Lower = more consistent answers
        maxOutputTokens: 400
      }
    });
    
    // Build context about this specific blockchain
    const chainContext = {
      'SOLANA': 'Solana has unique risks: freeze authority (can lock wallets) and mint authority (unlimited supply). These are CRITICAL on Solana.',
      'EVM': 'EVM chains are vulnerable to honeypots (cant sell), high taxes, and proxy contracts. Contract security is most important.',
      'CARDANO': 'Cardano uses minting policies. If policy is locked and expired, token is safe. If not locked, unlimited minting is possible.'
    }[chainType] || 'General blockchain security principles apply.';
    
    const criticalIssues = securityChecks
      .filter(check => check.severity === 'CRITICAL')
      .map(check => check.message)
      .join('\n');
    
    const warnings = securityChecks
      .filter(check => check.severity === 'WARNING')
      .map(check => check.message)
      .join('\n');
    
    const prompt = `
You are a crypto security expert analyzing a ${chainName} token.

TOKEN: ${tokenName}
CHAIN: ${chainName}
RISK SCORE: ${riskScore}/100 (${riskLevel} RISK)

CHAIN CONTEXT:
${chainContext}

CRITICAL ISSUES:
${criticalIssues || 'None'}

WARNINGS:
${warnings || 'None'}

Provide a 3-sentence risk assessment:
1. Main risk summary
2. Why it matters specifically on ${chainName}
3. Direct recommendation (BUY / RESEARCH / AVOID)

Be simple and direct. No jargon.
    `;
    
    console.log('[Gemini AI] Generating explanation...');
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    console.log('[Gemini AI] ✅ Explanation generated');
    return explanation;
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    return generateFallbackExplanation(tokenName, chainName, riskScore, riskLevel, securityChecks);
  }
}

/**
 * Fallback explanation if AI is unavailable
 */
function generateFallbackExplanation(
  tokenName: string,
  chainName: string,
  riskScore: number,
  riskLevel: string,
  securityChecks: SecurityCheck[]
): string {
  const criticalCount = securityChecks.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = securityChecks.filter(c => c.severity === 'WARNING').length;
  
  if (criticalCount > 0) {
    return `${tokenName} on ${chainName} has ${criticalCount} CRITICAL security issue(s). Risk score: ${riskScore}/100 (${riskLevel} RISK). These are serious vulnerabilities that could result in loss of funds. Recommendation: AVOID until issues are resolved.`;
  } else if (riskScore >= 50) {
    return `${tokenName} on ${chainName} shows elevated risk with ${warningCount} warning(s). Risk score: ${riskScore}/100 (${riskLevel} RISK). Recommendation: RESEARCH thoroughly before investing.`;
  } else {
    return `${tokenName} on ${chainName} appears relatively safe with risk score: ${riskScore}/100 (${riskLevel} RISK). Standard crypto investment risks still apply. Recommendation: Proceed with caution.`;
  }
}
