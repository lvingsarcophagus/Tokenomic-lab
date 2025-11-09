/**
 * ============================================================================
 * FLAG VALIDATION AND OVERRIDE SYSTEM
 * ============================================================================
 * 
 * FIXED: Prevents false positives by using context-aware flag validation
 * and graduated penalties instead of hard forcing to risk score 75.
 * 
 * Key improvements:
 * - Separates true critical flags from warnings
 * - Validates flags with context (token age, market cap, etc.)
 * - Requires 3+ critical flags for CRITICAL override
 * - Uses graduated penalties for 1-2 critical flags
 * 
 * Example fix:
 * - Before: UNI with 1 false flag → forced to 75 (CRITICAL) ❌
 * - After: UNI with 1 false flag → 29 + 15 penalty = 44 (MEDIUM) ✅
 */

import { RiskFactor, DataQuality } from './enhanced-risk-calculator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum FlagSeverity {
  CRITICAL = 'critical',    // Unsellable token or guaranteed scam
  WARNING = 'warning',      // Concerning but not fatal
  INFO = 'info'            // Positive signals or neutral information
}

export interface RiskFlag {
  message: string;
  severity: FlagSeverity;
  factor: RiskFactor;
  emoji: '🚨' | '⚠️' | '✅' | 'ℹ️';
}

// ============================================================================
// CONTEXT-AWARE FLAG VALIDATION
// ============================================================================

/**
 * Validates holder count flags with context to prevent false positives
 * 
 * Rules:
 * - <10 holders = ALWAYS critical (test token or scam)
 * - <50 holders + age <7 days = WARNING (new tokens start small)
 * - <50 holders + mcap <$100k = WARNING (small projects are normal)
 * - <50 holders + mcap >$1M = CRITICAL (suspicious concentration)
 * - <100 holders + age >365 days = WARNING (dead project, not scam)
 */
export function validateHolderCountFlag(
  holderCount: number,
  tokenAge: number,
  marketCap: number
): RiskFlag | null {
  
  // Extremely low holder count - always critical
  if (holderCount < 10) {
    return {
      message: `<10 holders - test token or scam`,
      severity: FlagSeverity.CRITICAL,
      factor: RiskFactor.CONCENTRATION_RISK,
      emoji: '🚨'
    };
  }
  
  // Low holder count - check context
  if (holderCount < 50) {
    // New token - give grace period
    if (tokenAge < 7) {
      return {
        message: `<50 holders but token is only ${tokenAge} days old`,
        severity: FlagSeverity.WARNING,
        factor: RiskFactor.CONCENTRATION_RISK,
        emoji: '⚠️'
      };
    }
    
    // Small market cap - normal to have few holders
    if (marketCap < 100_000) {
      return {
        message: `<50 holders but market cap is small ($${marketCap.toLocaleString()})`,
        severity: FlagSeverity.WARNING,
        factor: RiskFactor.CONCENTRATION_RISK,
        emoji: '⚠️'
      };
    }
    
    // Large market cap with few holders - very suspicious
    if (marketCap > 1_000_000) {
      return {
        message: `<50 holders with $${(marketCap / 1_000_000).toFixed(1)}M market cap - extreme concentration`,
        severity: FlagSeverity.CRITICAL,
        factor: RiskFactor.CONCENTRATION_RISK,
        emoji: '🚨'
      };
    }
    
    // Default warning for other cases
    return {
      message: `<50 holders`,
      severity: FlagSeverity.WARNING,
      factor: RiskFactor.CONCENTRATION_RISK,
      emoji: '⚠️'
    };
  }
  
  // Holder count is acceptable
  return null;
}

/**
 * Validates liquidity flags with context
 * 
 * Rules:
 * - Liquidity <$1k + mcap >$100k = CRITICAL (guaranteed rug)
 * - Liquidity <$10k + mcap >$1M = CRITICAL (will crash on sells)
 * - Liquidity <$50k + mcap <$500k = WARNING (thin but proportional)
 * - Liquidity dropped >50% in 7 days = CRITICAL (active rug)
 * - Liquidity dropped 15-50% in 7 days = WARNING (concerning)
 */
export function validateLiquidityFlag(
  liquidityUSD: number,
  marketCap: number,
  liquidityChange7d?: number
): RiskFlag | null {
  
  // Absolute liquidity checks
  if (liquidityUSD < 1_000 && marketCap > 100_000) {
    return {
      message: `Liquidity <$1k with $${(marketCap / 1_000).toFixed(0)}k market cap - rug pull setup`,
      severity: FlagSeverity.CRITICAL,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: '🚨'
    };
  }
  
  if (liquidityUSD < 10_000 && marketCap > 1_000_000) {
    return {
      message: `Liquidity <$10k with $${(marketCap / 1_000_000).toFixed(1)}M market cap - extreme sell pressure risk`,
      severity: FlagSeverity.CRITICAL,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: '🚨'
    };
  }
  
  // Liquidity drop detection
  if (liquidityChange7d !== undefined) {
    if (liquidityChange7d < -0.50) {
      return {
        message: `Liquidity dropped ${Math.abs(liquidityChange7d * 100).toFixed(0)}% in 7 days - active rug`,
        severity: FlagSeverity.CRITICAL,
        factor: RiskFactor.LIQUIDITY_RISK,
        emoji: '🚨'
      };
    }
    
    if (liquidityChange7d < -0.15) {
      return {
        message: `Liquidity dropped ${Math.abs(liquidityChange7d * 100).toFixed(0)}% in 7 days`,
        severity: FlagSeverity.WARNING,
        factor: RiskFactor.LIQUIDITY_RISK,
        emoji: '⚠️'
      };
    }
  }
  
  // Thin but proportional liquidity
  const liqRatio = liquidityUSD / marketCap;
  if (liqRatio < 0.01 && marketCap > 100_000) {
    return {
      message: `Liquidity <1% of market cap`,
      severity: FlagSeverity.WARNING,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: '⚠️'
    };
  }
  
  return null;
}

/**
 * Validates security flags (honeypot, taxes, authorities)
 * 
 * ALWAYS CRITICAL:
 * - is_honeypot = true
 * - sell_tax > 50%
 * - freeze_authority on Solana
 * 
 * CONTEXT-DEPENDENT:
 * - is_mintable + owner_not_renounced + age <30 days = CRITICAL
 * - is_mintable + owner_not_renounced + age >30 days = WARNING
 * - sell_tax 20-50% = WARNING
 * - buy_tax >20% = WARNING
 */
export function validateSecurityFlag(
  flagType: 'honeypot' | 'mintable' | 'tax' | 'freeze',
  data: {
    isHoneypot?: boolean;
    isMintable?: boolean;
    ownerRenounced?: boolean;
    sellTax?: number;
    buyTax?: number;
    freezeAuthority?: string | null;
    tokenAge?: number;
  }
): RiskFlag | null {
  
  // Honeypot - ALWAYS critical
  if (flagType === 'honeypot' && data.isHoneypot) {
    return {
      message: `HONEYPOT DETECTED - Cannot sell tokens`,
      severity: FlagSeverity.CRITICAL,
      factor: RiskFactor.CONTRACT_SECURITY,
      emoji: '🚨'
    };
  }
  
  // Freeze authority (Solana) - ALWAYS critical
  if (flagType === 'freeze' && data.freezeAuthority && data.freezeAuthority !== 'null') {
    return {
      message: `Freeze authority exists - creator can block wallets`,
      severity: FlagSeverity.CRITICAL,
      factor: RiskFactor.CONTRACT_SECURITY,
      emoji: '🚨'
    };
  }
  
  // Tax flags
  if (flagType === 'tax') {
    // Extreme sell tax - critical
    if (data.sellTax && data.sellTax > 0.50) {
      return {
        message: `${(data.sellTax * 100).toFixed(0)}% sell tax - exit blocked`,
        severity: FlagSeverity.CRITICAL,
        factor: RiskFactor.CONTRACT_SECURITY,
        emoji: '🚨'
      };
    }
    
    // High sell tax - warning
    if (data.sellTax && data.sellTax > 0.20) {
      return {
        message: `${(data.sellTax * 100).toFixed(0)}% sell tax`,
        severity: FlagSeverity.WARNING,
        factor: RiskFactor.CONTRACT_SECURITY,
        emoji: '⚠️'
      };
    }
    
    // High buy tax - warning
    if (data.buyTax && data.buyTax > 0.20) {
      return {
        message: `${(data.buyTax * 100).toFixed(0)}% buy tax`,
        severity: FlagSeverity.WARNING,
        factor: RiskFactor.CONTRACT_SECURITY,
        emoji: '⚠️'
      };
    }
  }
  
  // Mintable token flags - context dependent
  if (flagType === 'mintable' && data.isMintable && !data.ownerRenounced) {
    const age = data.tokenAge || 0;
    
    // New mintable token with active owner - critical
    if (age < 30) {
      return {
        message: `Owner can mint unlimited tokens (token only ${age} days old)`,
        severity: FlagSeverity.CRITICAL,
        factor: RiskFactor.CONTRACT_SECURITY,
        emoji: '🚨'
      };
    }
    
    // Old mintable token - warning (less likely to rug after surviving this long)
    return {
      message: `Owner can mint tokens but project is established`,
      severity: FlagSeverity.WARNING,
      factor: RiskFactor.CONTRACT_SECURITY,
      emoji: '⚠️'
    };
  }
  
  return null;
}

/**
 * Validates market cap to liquidity ratio
 * 
 * This prevents the UNI false positive where a 656x ratio triggered
 * critical override even though it's a legitimate established token.
 * 
 * Rules:
 * - Ratio >1000x + age <30 days = CRITICAL (obvious rug setup)
 * - Ratio >1000x + age >365 days = WARNING (established but illiquid)
 * - Ratio 500-1000x + age <90 days = WARNING
 * - Ratio 500-1000x + age >365 days = INFO (note for user)
 */
export function validateLiquidityRatioFlag(
  liquidityUSD: number,
  marketCap: number,
  tokenAge: number
): RiskFlag | null {
  
  if (liquidityUSD === 0 || marketCap === 0) return null;
  
  const ratio = marketCap / liquidityUSD;
  
  // Extreme ratio on new token - critical
  if (ratio > 1000 && tokenAge < 30) {
    return {
      message: `${ratio.toFixed(0)}x market cap to liquidity ratio on new token - rug pull setup`,
      severity: FlagSeverity.CRITICAL,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: '🚨'
    };
  }
  
  // Extreme ratio on old token - just a warning
  if (ratio > 1000 && tokenAge > 365) {
    return {
      message: `${ratio.toFixed(0)}x market cap to liquidity ratio - high slippage expected`,
      severity: FlagSeverity.WARNING,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: '⚠️'
    };
  }
  
  // High ratio on medium-age token - warning
  if (ratio > 500 && tokenAge < 90) {
    return {
      message: `${ratio.toFixed(0)}x market cap to liquidity ratio - monitor closely`,
      severity: FlagSeverity.WARNING,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: '⚠️'
    };
  }
  
  // High ratio on established token - informational only
  if (ratio > 500 && tokenAge > 365) {
    return {
      message: `${ratio.toFixed(0)}x market cap to liquidity ratio - established but illiquid`,
      severity: FlagSeverity.INFO,
      factor: RiskFactor.LIQUIDITY_RISK,
      emoji: 'ℹ️'
    };
  }
  
  return null;
}

// ============================================================================
// GRADUATED PENALTY SYSTEM
// ============================================================================

/**
 * NEW OVERRIDE LOGIC: Graduated penalties instead of hard 75 minimum
 * 
 * Rules:
 * - 0 critical flags: Use calculated score as-is
 * - 1 critical flag: Add 15 point penalty (but don't force to 75)
 * - 2 critical flags: Add 25 point penalty or force to 65 (HIGH risk)
 * - 3+ critical flags: Force to minimum 75 (CRITICAL risk)
 * 
 * This prevents single false positives from destroying analysis while
 * still catching truly dangerous tokens with multiple severe issues.
 * 
 * Example outcomes:
 * - UNI: score 29, 1 false flag → 29 + 15 = 44 (MEDIUM) ✅
 * - New scam: score 60, 3 real flags → max(60, 75) = 75 (CRITICAL) ✅
 */
export function applyFlagBasedOverride(
  calculatedScore: number,
  flags: RiskFlag[]
): {
  finalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  overrideReason?: string;
} {
  
  // Count critical flags
  const criticalFlags = flags.filter(f => f.severity === FlagSeverity.CRITICAL);
  const criticalCount = criticalFlags.length;
  
  let finalScore = calculatedScore;
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  let overrideReason: string | undefined;
  
  // Apply graduated penalties based on critical flag count
  if (criticalCount === 0) {
    // No critical issues - use calculated score as-is
    finalScore = calculatedScore;
  } 
  else if (criticalCount === 1) {
    // One critical issue - add penalty but don't force to CRITICAL
    finalScore = Math.min(calculatedScore + 15, 100);
    overrideReason = `1 critical flag detected - added 15 point penalty`;
  } 
  else if (criticalCount === 2) {
    // Two critical issues - significant penalty or force to HIGH
    finalScore = Math.max(calculatedScore + 25, 65);
    finalScore = Math.min(finalScore, 100);
    overrideReason = `2 critical flags detected - elevated to HIGH risk minimum`;
  } 
  else {
    // Three or more critical issues - force to CRITICAL
    finalScore = Math.max(calculatedScore, 75);
    overrideReason = `${criticalCount} critical flags detected - elevated to CRITICAL risk`;
  }
  
  // Determine risk level from final score
  if (finalScore >= 75) {
    riskLevel = 'CRITICAL';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 30) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }
  
  return { finalScore, riskLevel, overrideReason };
}

/**
 * Helper: Categorize flags by severity for result display
 */
export function categorizeFlags(flags: RiskFlag[]): {
  critical: string[];
  warnings: string[];
  positive: string[];
} {
  return {
    critical: flags
      .filter(f => f.severity === FlagSeverity.CRITICAL)
      .map(f => `${f.emoji} ${f.message}`),
    warnings: flags
      .filter(f => f.severity === FlagSeverity.WARNING)
      .map(f => `${f.emoji} ${f.message}`),
    positive: flags
      .filter(f => f.severity === FlagSeverity.INFO)
      .map(f => `${f.emoji} ${f.message}`)
  };
}
