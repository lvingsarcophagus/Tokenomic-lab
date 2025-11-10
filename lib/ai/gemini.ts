/**
 * Gemini AI Integration
 * - Detect meme tokens with AI
 * - Generate plain English risk explanations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SecurityCheck } from '../security/adapters';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// ============================================================================
// MEME TOKEN DETECTION
// ============================================================================

export interface MemeDetectionResult {
  isMeme: boolean;
  confidence: number;
  reasoning: string;
}

/**
 * Use Gemini AI to detect if token is a meme coin
 */
export async function detectMemeTokenWithAI(
  tokenData: any,
  metadata?: any
): Promise<MemeDetectionResult> {
  
  const ai = getGenAI();
  
  if (!ai) {
    console.log('[Gemini AI] No API key configured, using fallback');
    return detectMemeFallback(tokenData, metadata);
  }
  
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent classification
        maxOutputTokens: 200
      }
    });
    
    const prompt = `
Classify this cryptocurrency token as MEME or UTILITY.

Token: ${tokenData.name || 'Unknown'} (${tokenData.symbol || 'Unknown'})
Description: ${metadata?.description || 'None provided'}
Category: ${metadata?.category || 'Unknown'}

MEME indicators:
- Names: PEPE, SHIB, DOGE, MAGA, TRUMP, MOON, SAFE, INU, FLOKI
- Themes: dogs, cats, political figures, internet memes
- Purpose: purely speculative, no utility
- Community: hype-driven, sentiment-based

UTILITY indicators:
- Clear product or service
- Technical whitepaper
- DeFi protocol (staking, lending, DEX)
- Infrastructure (oracles, bridges)
- Gaming, NFT platforms

Respond ONLY in this JSON format:
{
  "classification": "MEME" or "UTILITY",
  "confidence": 0-100,
  "reasoning": "brief explanation in one sentence"
}
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const response = JSON.parse(jsonMatch[0]);
      
      console.log(`[Gemini AI] Classification: ${response.classification} (${response.confidence}%)`);
      
      return {
        isMeme: response.classification === 'MEME',
        confidence: response.confidence,
        reasoning: response.reasoning
      };
    }
    
    throw new Error('Invalid JSON response from Gemini');
    
  } catch (error: any) {
    console.error('[Gemini AI] Meme detection failed:', error.message);
    return detectMemeFallback(tokenData, metadata);
  }
}

/**
 * Fallback rule-based meme detection
 */
function detectMemeFallback(tokenData: any, metadata?: any): MemeDetectionResult {
  const name = (tokenData.name || '').toUpperCase();
  const symbol = (tokenData.symbol || '').toUpperCase();
  const description = (metadata?.description || '').toUpperCase();
  
  const memeKeywords = [
    'MAGA', 'TRUMP', 'PEPE', 'SHIB', 'DOGE', 'INU', 'FLOKI', 
    'MOON', 'SAFE', 'ELON', 'BABY', 'ROCKET', 'WOJAK',
    'CAT', 'DOG', 'FROG', 'APE', 'BONK'
  ];
  
  const hasMemeName = memeKeywords.some(keyword => 
    name.includes(keyword) || symbol.includes(keyword) || description.includes(keyword)
  );
  
  if (hasMemeName) {
    return {
      isMeme: true,
      confidence: 80,
      reasoning: 'Token name/symbol matches known meme patterns'
    };
  }
  
  return {
    isMeme: false,
    confidence: 60,
    reasoning: 'No meme indicators detected (rule-based)'
  };
}

// ============================================================================
// AI RISK EXPLANATION
// ============================================================================

/**
 * Generate plain English risk explanation using Gemini AI
 */
export async function generateAIExplanation(
  tokenName: string,
  chainName: string,
  riskScore: number,
  riskLevel: string,
  securityChecks: SecurityCheck[],
  isMeme: boolean
): Promise<string> {
  
  const ai = getGenAI();
  
  if (!ai) {
    console.log('[Gemini AI] No API key configured, using fallback explanation');
    return generateFallbackExplanation(tokenName, riskScore, riskLevel, securityChecks);
  }
  
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 400
      }
    });
    
    const criticalIssues = securityChecks
      .filter(c => c.severity === 'CRITICAL')
      .map(c => c.message)
      .join('\n');
    
    const warningIssues = securityChecks
      .filter(c => c.severity === 'WARNING')
      .map(c => c.message)
      .join('\n');
    
    const prompt = `
You are a crypto security expert analyzing ${tokenName} on ${chainName}.

Risk Score: ${riskScore}/100 (${riskLevel} RISK)
Token Type: ${isMeme ? 'Meme Coin' : 'Utility Token'}

Critical Issues:
${criticalIssues || 'None detected'}

Warning Issues:
${warningIssues || 'None detected'}

Provide a 3-sentence risk assessment:
1. Main risk summary in simple terms
2. Why this matters specifically on ${chainName}
3. Direct recommendation: BUY / RESEARCH MORE / AVOID

Use simple language. Be direct and actionable.
    `;
    
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    
    console.log(`[Gemini AI] Generated explanation (${explanation.length} chars)`);
    
    return explanation;
    
  } catch (error: any) {
    console.error('[Gemini AI] Explanation failed:', error.message);
    return generateFallbackExplanation(tokenName, riskScore, riskLevel, securityChecks);
  }
}

/**
 * Fallback explanation without AI
 */
function generateFallbackExplanation(
  tokenName: string,
  riskScore: number,
  riskLevel: string,
  securityChecks: SecurityCheck[]
): string {
  
  const criticalCount = securityChecks.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = securityChecks.filter(c => c.severity === 'WARNING').length;
  
  let explanation = `${tokenName} has a risk score of ${riskScore}/100 (${riskLevel}). `;
  
  if (criticalCount > 0) {
    const issues = securityChecks
      .filter(c => c.severity === 'CRITICAL')
      .map(c => c.name)
      .join(', ');
    
    explanation += `Critical issues detected: ${issues}. `;
    
    if (riskScore >= 75) {
      explanation += `AVOID - Critical security risks make this token dangerous to hold.`;
    } else {
      explanation += `RESEARCH MORE - Address these critical issues before investing.`;
    }
  } else if (warningCount > 0) {
    explanation += `${warningCount} warning${warningCount > 1 ? 's' : ''} found. `;
    
    if (riskScore >= 50) {
      explanation += `RESEARCH MORE - Moderate risks require careful evaluation.`;
    } else {
      explanation += `RESEARCH MORE - Review warnings but token shows potential.`;
    }
  } else {
    if (riskScore < 30) {
      explanation += `No major security issues detected. BUY - Token passes basic security checks.`;
    } else if (riskScore < 50) {
      explanation += `Some risk factors present. RESEARCH MORE - Check tokenomics carefully.`;
    } else {
      explanation += `Elevated risk from market factors. RESEARCH MORE - High risk environment.`;
    }
  }
  
  return explanation;
}

/**
 * Generate AI-powered insights for specific risk factors
 */
export async function generateFactorInsights(
  factors: Record<string, number>,
  tokenName: string
): Promise<string[]> {
  
  const ai = getGenAI();
  if (!ai) return [];
  
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Find top 3 riskiest factors
    const sorted = Object.entries(factors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    const prompt = `
Explain these risk factors for ${tokenName} in simple terms (one sentence each):

${sorted.map(([name, score]) => `- ${name.replace(/_/g, ' ')}: ${score}/100`).join('\n')}

Focus on what each means for investors.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return text.split('\n').filter(line => line.trim().length > 0);
    
  } catch (error) {
    return [];
  }
}
