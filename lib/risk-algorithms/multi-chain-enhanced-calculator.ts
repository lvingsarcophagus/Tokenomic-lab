/**
 * ============================================================================
 * MULTI-CHAIN ENHANCED RISK ALGORITHM
 * ============================================================================
 * 
 * Extends the 7-factor algorithm with:
 * - Multi-chain security analysis (EVM/Solana/Cardano)
 * - Behavioral tokenomics (holder velocity, liquidity stability)
 * - Smart money detection (VC wallets, wallet age)
 * - Context-aware thresholds (dynamic based on token age, market cap)
 */

import { 
  TokenData,
  RiskAnalysisResult, 
  RiskFactor, 
  DataQuality,
  calculateConcentrationRisk,
  calculateLiquidityRisk,
  calculateMarketActivity,
  calculateSupplyRisk,
  calculateDeflationMechanics,
  calculateTokenAge,
  applyMarketCapDiscount,
  calculateDataFreshness,
  FACTOR_WEIGHTS
} from './enhanced-risk-calculator'

import {
  RiskFlag,
  FlagSeverity,
  validateHolderCountFlag,
  validateLiquidityFlag,
  validateSecurityFlag,
  validateLiquidityRatioFlag,
  applyFlagBasedOverride,
  categorizeFlags
} from './flag-validation'

// ============================================================================
// EXTENDED TYPE DEFINITIONS
// ============================================================================

// RiskScore interface for function returns
interface RiskScore {
  score: number;
  flags: string[];
  quality: DataQuality;
}

export interface MultiChainTokenData extends TokenData {
  // Chain identification
  chainType?: 'EVM' | 'SOLANA' | 'CARDANO' | 'OTHER';
  
  // Behavioral metrics (from Moralis API)
  holderHistory?: {
    current: number;
    day7Ago: number;
    day30Ago: number;
  };
  
  liquidityHistory?: {
    current: number;
    day7Ago: number;
    day30Ago: number;
  };
  
  // Transaction pattern data
  uniqueBuyers24h?: number;
  uniqueSellers24h?: number;
  buyTransactions24h?: number;
  sellTransactions24h?: number;
  
  // Wallet analysis
  deployerWalletAge?: number;        // Days since deployer wallet creation
  averageHolderWalletAge?: number;   // Average age of all holder wallets
  knownVCHolders?: string[];         // List of known VC wallet addresses
  
  // Chain-specific security data
  solanaData?: {
    freezeAuthority: string | null;   // Can freeze wallets
    mintAuthority: string | null;     // Can mint more tokens
    programAuthority: string | null;  // Can upgrade contract
  };
  
  cardanoData?: {
    policyLocked: boolean;            // Minting policy is time-locked
    policyExpired: boolean;           // Can no longer mint
    policyScript: string;             // Script hash for verification
  };
}

// ============================================================================
// CHAIN DETECTION AND ROUTING
// ============================================================================

export function detectChainType(chainId: number): 'EVM' | 'SOLANA' | 'CARDANO' | 'OTHER' {
  const EVM_CHAINS = [1, 56, 137, 43114, 250, 42161, 10, 8453, 11155111];
  
  if (EVM_CHAINS.includes(chainId)) return 'EVM';
  if (chainId === 501) return 'SOLANA';
  if (chainId === 1815) return 'CARDANO';
  return 'OTHER';
}

// ============================================================================
// CHAIN-SPECIFIC SECURITY ANALYSIS
// ============================================================================

export function analyzeSolanaSecurity(data: MultiChainTokenData): RiskScore {
  let score = 0;
  const flags: string[] = [];
  
  if (!data.solanaData) {
    return { score: 50, flags: ['⚠️ Solana security data unavailable'], quality: DataQuality.UNKNOWN };
  }
  
  // Critical: Freeze authority allows blocking user wallets
  if (data.solanaData.freezeAuthority && data.solanaData.freezeAuthority !== 'null') {
    score += 50;
    flags.push('🚨 Token has freeze authority - creator can block wallets');
  }
  
  // Mint authority with context
  if (data.solanaData.mintAuthority && data.solanaData.mintAuthority !== 'null') {
    if (data.ageDays && data.ageDays < 90) {
      score += 40;
      flags.push('⚠️ New token with mint authority - can create unlimited supply');
    } else {
      score += 20;
      flags.push('⚠️ Mint authority exists but token is established');
    }
  }
  
  // Program upgrade capability
  if (data.solanaData.programAuthority && data.solanaData.programAuthority !== 'null') {
    score += 25;
    flags.push('⚠️ Contract is upgradeable - logic can change');
  }
  
  // Positive signal: All authorities revoked
  if (!data.solanaData.freezeAuthority && 
      !data.solanaData.mintAuthority && 
      !data.solanaData.programAuthority) {
    flags.push('✅ All authorities revoked - fully decentralized');
  }
  
  return { score: Math.min(score, 100), flags, quality: DataQuality.VERIFIED };
}

export function analyzeCardanoSecurity(data: MultiChainTokenData): RiskScore {
  let score = 0;
  const flags: string[] = [];
  
  if (!data.cardanoData) {
    return { score: 50, flags: ['⚠️ Cardano policy data unavailable'], quality: DataQuality.UNKNOWN };
  }
  
  // Best case: Time-locked policy that has expired
  if (data.cardanoData.policyLocked && data.cardanoData.policyExpired) {
    score = 0;
    flags.push('✅ Minting policy expired - supply is permanently fixed');
    return { score, flags, quality: DataQuality.VERIFIED };
  }
  
  // Good case: Time-locked but not yet expired
  if (data.cardanoData.policyLocked && !data.cardanoData.policyExpired) {
    score = 15;
    flags.push('⚠️ Minting policy will expire - supply will become fixed');
  }
  
  // Bad case: No time lock (always mintable)
  if (!data.cardanoData.policyLocked) {
    score = 60;
    flags.push('🚨 No minting time lock - unlimited supply possible');
  }
  
  // Additional check: Complex policy script
  if (data.cardanoData.policyScript && data.cardanoData.policyScript.length > 100) {
    score += 10;
    flags.push('⚠️ Complex minting policy - requires expert audit');
  }
  
  return { score: Math.min(score, 100), flags, quality: DataQuality.VERIFIED };
}

// ============================================================================
// BEHAVIORAL TOKENOMICS ANALYSIS
// ============================================================================

export function calculateHolderVelocity(data: MultiChainTokenData): {
  score: number;
  flags: string[];
} {
  let score = 0;
  const flags: string[] = [];
  
  if (!data.holderHistory) {
    return { score: 0, flags: [] };
  }
  
  const current = data.holderHistory.current;
  const day7 = data.holderHistory.day7Ago;
  const day30 = data.holderHistory.day30Ago;
  
  // 7-day analysis
  if (day7 > 0) {
    const change7d = (current - day7) / day7;
    
    // High churn (holders leaving)
    if (change7d < -0.30) {
      score += 40;
      flags.push('🚨 30%+ holders exited in 7 days - panic selling');
    } else if (change7d < -0.15) {
      score += 25;
      flags.push('⚠️ 15%+ holders exited in 7 days');
    }
    
    // Suspicious rapid growth (possible bot farming)
    if (change7d > 1.0 && current < 1000) {
      score += 20;
      flags.push('⚠️ 100%+ holder growth in 7 days - possible bot network');
    }
  }
  
  // 30-day trend analysis
  if (day30 > 0) {
    const change30d = (current - day30) / day30;
    
    // Declining over time
    if (change30d < -0.20) {
      score += 15;
      flags.push('⚠️ Holder count declining over 30 days');
    }
    
    // Healthy growth
    if (change30d > 0.20 && change30d < 1.0) {
      score -= 5;
      flags.push('✅ Steady holder growth over 30 days');
    }
  }
  
  return { score: Math.min(Math.max(score, 0), 50), flags };
}

export function calculateLiquidityStability(data: MultiChainTokenData): {
  score: number;
  flags: string[];
} {
  let score = 0;
  const flags: string[] = [];
  
  if (!data.liquidityHistory || !data.liquidityHistory.day7Ago) {
    return { score: 0, flags: [] };
  }
  
  const current = data.liquidityHistory.current;
  const day7 = data.liquidityHistory.day7Ago;
  
  if (day7 === 0) return { score: 0, flags: [] };
  
  const change = (current - day7) / day7;
  
  // Major liquidity removal
  if (change < -0.30) {
    score += 50;
    flags.push('🚨 Liquidity dropped >30% in 7 days - rug pull warning');
  } else if (change < -0.15) {
    score += 25;
    flags.push('⚠️ Liquidity dropped >15% in 7 days');
  }
  
  // Suspicious spike (pump setup)
  if (change > 2.0 && data.ageDays && data.ageDays < 30) {
    score += 30;
    flags.push('⚠️ Liquidity spiked >200% on new token - possible pump setup');
  }
  
  // Stable liquidity (good sign)
  if (Math.abs(change) < 0.10) {
    score -= 5;
    flags.push('✅ Stable liquidity over 7 days');
  }
  
  return { score: Math.min(Math.max(score, 0), 50), flags };
}

export function detectWashTrading(data: MultiChainTokenData): {
  score: number;
  flags: string[];
} {
  let score = 0;
  const flags: string[] = [];
  
  if (!data.uniqueBuyers24h || !data.uniqueSellers24h) {
    return { score: 0, flags: [] };
  }
  
  const buyerSellerRatio = data.uniqueBuyers24h / Math.max(data.uniqueSellers24h, 1);
  const totalUnique = data.uniqueBuyers24h + data.uniqueSellers24h;
  const totalTx = (data.buyTransactions24h || 0) + (data.sellTransactions24h || 0);
  
  // Circular trading pattern
  if (totalTx > 50 && totalUnique < 20) {
    score += 35;
    flags.push('🚨 High transaction count but few unique wallets - wash trading');
  }
  
  // Extreme buy/sell imbalance
  if (buyerSellerRatio > 5 || buyerSellerRatio < 0.2) {
    score += 25;
    flags.push('⚠️ Extreme buy/sell imbalance - possible manipulation');
  }
  
  // Very few participants for high volume
  if (data.volume24h && data.marketCap && totalUnique > 0) {
    const volumePerWallet = data.volume24h / totalUnique;
    const avgWalletSize = data.marketCap / (data.holderCount || 1);
    
    if (volumePerWallet > avgWalletSize * 10) {
      score += 20;
      flags.push('⚠️ Volume too high for participant count - artificial activity');
    }
  }
  
  return { score: Math.min(score, 50), flags };
}

export function detectSmartMoney(data: MultiChainTokenData): {
  score: number;
  flags: string[];
} {
  let score = 50; // Start neutral
  const flags: string[] = [];
  
  // VC backing check
  if (data.knownVCHolders && data.knownVCHolders.length > 0) {
    score -= 20;
    flags.push(`✅ ${data.knownVCHolders.length} known VC wallets holding token`);
  }
  
  // Average holder wallet age
  if (data.averageHolderWalletAge !== undefined) {
    if (data.averageHolderWalletAge < 30) {
      score += 25;
      flags.push('⚠️ Average holder wallet <30 days old - possible bot network');
    } else if (data.averageHolderWalletAge > 365) {
      score -= 10;
      flags.push('✅ Holders have established wallets (>1 year old)');
    }
  }
  
  // Deployer wallet age
  if (data.deployerWalletAge !== undefined) {
    if (data.deployerWalletAge < 7) {
      score += 20;
      flags.push('⚠️ Deployer wallet created <7 days before token launch');
    } else if (data.deployerWalletAge > 365) {
      score -= 5;
      flags.push('✅ Deployer has established wallet');
    }
  }
  
  return { score: Math.max(0, Math.min(score, 100)), flags };
}

// ============================================================================
// CONTEXT-AWARE THRESHOLD ADJUSTMENTS
// ============================================================================

export function applyContextualAdjustments(
  baseScore: number,
  factor: RiskFactor,
  data: MultiChainTokenData
): number {
  let adjustedScore = baseScore;
  
  // TOKEN AGE ADJUSTMENTS
  if (data.ageDays !== undefined) {
    // New tokens (0-7 days)
    if (data.ageDays < 7) {
      if (factor === RiskFactor.CONCENTRATION_RISK) {
        adjustedScore *= 0.7; // Reduce by 30%
      }
      if (factor === RiskFactor.MARKET_ACTIVITY) {
        adjustedScore *= 0.6; // Reduce by 40%
      }
    }
    // Old tokens (>365 days)
    else if (data.ageDays > 365) {
      if (factor === RiskFactor.MARKET_ACTIVITY && adjustedScore > 40) {
        adjustedScore *= 1.3; // Increase penalty by 30%
      }
    }
  }
  
  // MARKET CAP ADJUSTMENTS
  if (data.marketCap && factor === RiskFactor.CONCENTRATION_RISK) {
    // Small cap (<$1M)
    if (data.marketCap < 1_000_000) {
      if (data.holderCount && data.holderCount < 500) {
        adjustedScore *= 0.6;
      }
    }
    // Large cap (>$10M)
    else if (data.marketCap > 10_000_000) {
      if (data.holderCount && data.holderCount < 1000) {
        adjustedScore *= 1.5;
      }
    }
  }
  
  // LIQUIDITY-MARKETCAP RELATIONSHIP
  if (factor === RiskFactor.LIQUIDITY_RISK && data.marketCap && data.liquidityUSD) {
    const liqRatio = data.liquidityUSD / data.marketCap;
    
    if (data.marketCap > 5_000_000 && liqRatio < 0.01) {
      adjustedScore *= 1.4;
    }
    else if (data.marketCap < 1_000_000 && liqRatio > 0.03) {
      adjustedScore *= 0.8;
    }
  }
  
  return Math.min(adjustedScore, 100);
}

// ============================================================================
// ENHANCED FACTOR CALCULATORS
// ============================================================================

function calculateEnhancedContractSecurity(data: MultiChainTokenData): RiskScore {
  const chainType = data.chainType || detectChainType(data.chainId);
  
  if (chainType === 'SOLANA') {
    return analyzeSolanaSecurity(data);
  } else if (chainType === 'CARDANO') {
    return analyzeCardanoSecurity(data);
  }
  
  // EVM or OTHER: Use existing GoPlus logic
  // Import and use your existing calculateContractSecurity
  const flags: string[] = [];
  let score = 0;
  
  if (data.is_honeypot) {
    score += 100;
    flags.push('🚨 HONEYPOT DETECTED - Cannot sell tokens');
    return { score: 100, flags, quality: DataQuality.VERIFIED };
  }
  
  if (data.is_mintable) {
    score += 40;
    flags.push('⚠️ Owner can mint unlimited tokens');
  }
  
  if (!data.owner_renounced) {
    score += 30;
    flags.push('⚠️ Ownership not renounced');
  }
  
  const totalTax = (data.buy_tax || 0) + (data.sell_tax || 0);
  if (totalTax > 0.20) {
    score += 35;
    flags.push(`🚨 High taxes: ${(totalTax * 100).toFixed(1)}%`);
  } else if (totalTax > 0.10) {
    score += 15;
    flags.push(`⚠️ Moderate taxes: ${(totalTax * 100).toFixed(1)}%`);
  }
  
  if (!data.is_open_source) {
    score += 20;
    flags.push('⚠️ Contract not verified');
  }
  
  return { score: Math.min(score, 100), flags, quality: DataQuality.VERIFIED };
}

function calculateEnhancedConcentrationRisk(data: MultiChainTokenData): RiskScore {
  const baseResult = calculateConcentrationRisk(data);
  let score = baseResult.score;
  const flags = [...baseResult.flags];
  
  // Add holder velocity
  const velocityResult = calculateHolderVelocity(data);
  score = Math.min(score + velocityResult.score, 100);
  flags.push(...velocityResult.flags);
  
  // Add smart money analysis
  const smartMoneyResult = detectSmartMoney(data);
  score = (score + smartMoneyResult.score) / 2;
  flags.push(...smartMoneyResult.flags);
  
  // Apply contextual adjustments
  score = applyContextualAdjustments(score, RiskFactor.CONCENTRATION_RISK, data);
  
  return { score, flags, quality: baseResult.quality };
}

function calculateEnhancedLiquidityRisk(data: MultiChainTokenData): RiskScore {
  const baseResult = calculateLiquidityRisk(data);
  let score = baseResult.score;
  const flags = [...baseResult.flags];
  
  // Add liquidity stability
  const stabilityResult = calculateLiquidityStability(data);
  score = Math.min(score + stabilityResult.score, 100);
  flags.push(...stabilityResult.flags);
  
  // Apply contextual adjustments
  score = applyContextualAdjustments(score, RiskFactor.LIQUIDITY_RISK, data);
  
  return { score, flags, quality: baseResult.quality };
}

function calculateEnhancedMarketActivity(data: MultiChainTokenData): RiskScore {
  const baseResult = calculateMarketActivity(data);
  let score = baseResult.score;
  const flags = [...baseResult.flags];
  
  // Add wash trading detection
  const washTradingResult = detectWashTrading(data);
  score = Math.min(score + washTradingResult.score, 100);
  flags.push(...washTradingResult.flags);
  
  // Apply contextual adjustments
  score = applyContextualAdjustments(score, RiskFactor.MARKET_ACTIVITY, data);
  
  return { score, flags, quality: baseResult.quality };
}

// ============================================================================
// MAIN ENHANCED CALCULATION FUNCTION
// ============================================================================

export function calculateMultiChainTokenRisk(data: MultiChainTokenData): RiskAnalysisResult {
  // Detect chain type
  data.chainType = data.chainType || detectChainType(data.chainId);
  
  console.log(`[MultiChain Algorithm] Analyzing token on ${data.chainType} chain (chainId: ${data.chainId})`);
  
  // Calculate all 7 factors
  const factorResults = {
    [RiskFactor.CONTRACT_SECURITY]: calculateEnhancedContractSecurity(data),
    [RiskFactor.SUPPLY_RISK]: calculateSupplyRisk(data),
    [RiskFactor.CONCENTRATION_RISK]: calculateEnhancedConcentrationRisk(data),
    [RiskFactor.LIQUIDITY_RISK]: calculateEnhancedLiquidityRisk(data),
    [RiskFactor.MARKET_ACTIVITY]: calculateEnhancedMarketActivity(data),
    [RiskFactor.DEFLATION_MECHANICS]: calculateDeflationMechanics(data),
    [RiskFactor.TOKEN_AGE]: calculateTokenAge(data)
  };
  
  // Apply market cap discounts
  const contractScore = applyMarketCapDiscount(
    factorResults[RiskFactor.CONTRACT_SECURITY].score,
    data.marketCap
  );
  
  // Weighted scoring
  let totalWeight = 0;
  let weightedSum = 0;
  let verifiedWeight = 0;
  let estimatedWeight = 0;
  
  const factorScores: Record<RiskFactor, any> = {} as any;
  
  Object.entries(factorResults).forEach(([factorKey, result]) => {
    const factor = factorKey as RiskFactor;
    const weight = FACTOR_WEIGHTS[factor];
    const score = factor === RiskFactor.CONTRACT_SECURITY ? contractScore : result.score;
    
    factorScores[factor] = {
      score,
      weight,
      quality: result.quality,
      flags: result.flags
    };
    
    if (result.quality !== DataQuality.UNKNOWN) {
      totalWeight += weight;
      weightedSum += score * weight;
      
      if (result.quality === DataQuality.VERIFIED) {
        verifiedWeight += weight;
      } else {
        estimatedWeight += weight;
      }
    }
  });
  
  // Calculate final scores
  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) : 50;
  const freshness = calculateDataFreshness(data.dataTimestamp || Date.now());
  const baseConfidence = (verifiedWeight * 100) + (estimatedWeight * 70);
  const finalConfidence = baseConfidence * freshness;
  
  // ============================================================================
  // NEW: CONTEXT-AWARE FLAG VALIDATION
  // ============================================================================
  
  const validatedFlags: RiskFlag[] = [];
  
  // Validate holder count with context
  if (data.holderCount !== undefined) {
    const holderFlag = validateHolderCountFlag(
      data.holderCount,
      data.ageDays || 0,
      data.marketCap || 0
    );
    if (holderFlag) validatedFlags.push(holderFlag);
  }
  
  // Validate liquidity with context
  if (data.liquidityUSD !== undefined) {
    const liquidityChange = data.liquidityHistory 
      ? (data.liquidityHistory.current - data.liquidityHistory.day7Ago) / data.liquidityHistory.day7Ago
      : undefined;
    
    const liqFlag = validateLiquidityFlag(
      data.liquidityUSD,
      data.marketCap || 0,
      liquidityChange
    );
    if (liqFlag) validatedFlags.push(liqFlag);
    
    // Also check liquidity ratio separately
    const ratioFlag = validateLiquidityRatioFlag(
      data.liquidityUSD,
      data.marketCap || 0,
      data.ageDays || 0
    );
    if (ratioFlag) validatedFlags.push(ratioFlag);
  }
  
  // Validate security flags
  if (data.is_honeypot) {
    const honeypotFlag = validateSecurityFlag('honeypot', { isHoneypot: true });
    if (honeypotFlag) validatedFlags.push(honeypotFlag);
  }
  
  if (data.solanaData?.freezeAuthority) {
    const freezeFlag = validateSecurityFlag('freeze', {
      freezeAuthority: data.solanaData.freezeAuthority
    });
    if (freezeFlag) validatedFlags.push(freezeFlag);
  }
  
  if (data.sell_tax || data.buy_tax) {
    const taxFlag = validateSecurityFlag('tax', {
      sellTax: data.sell_tax,
      buyTax: data.buy_tax
    });
    if (taxFlag) validatedFlags.push(taxFlag);
  }
  
  if (data.is_mintable !== undefined && data.owner_renounced !== undefined) {
    const mintFlag = validateSecurityFlag('mintable', {
      isMintable: data.is_mintable,
      ownerRenounced: data.owner_renounced,
      tokenAge: data.ageDays
    });
    if (mintFlag) validatedFlags.push(mintFlag);
  }
  
  // Collect flags from factor calculations (legacy flags)
  const legacyFlags: string[] = [];
  Object.values(factorResults).forEach(result => {
    result.flags.forEach(flag => {
      legacyFlags.push(flag);
    });
  });
  
  // ============================================================================
  // NEW: GRADUATED PENALTY SYSTEM
  // ============================================================================
  
  const { finalScore, riskLevel, overrideReason } = applyFlagBasedOverride(
    rawScore,
    validatedFlags
  );
  
  console.log(`[MultiChain Algorithm] Raw score: ${rawScore.toFixed(2)}, Critical flags: ${validatedFlags.filter(f => f.severity === FlagSeverity.CRITICAL).length}, Final score: ${finalScore.toFixed(2)}`);
  if (overrideReason) {
    console.log(`[MultiChain Algorithm] Override: ${overrideReason}`);
  }
  
  // Categorize flags by severity
  const { critical, warnings, positive } = categorizeFlags(validatedFlags);
  
  // Merge with legacy flags (categorize by emoji)
  const criticalFlags = [
    ...critical,
    ...legacyFlags.filter(f => f.startsWith('🚨'))
  ];
  
  const warningFlags = [
    ...warnings,
    ...legacyFlags.filter(f => f.startsWith('⚠️'))
  ];
  
  const positiveSignals = [
    ...positive,
    ...legacyFlags.filter(f => f.startsWith('✅'))
  ];
  
  // Determine data tier
  let dataTier: RiskAnalysisResult['data_tier'];
  const hasAdvancedData = !!(data.holderHistory || data.liquidityHistory || data.solanaData || data.cardanoData);
  
  if (hasAdvancedData && freshness > 0.85 && verifiedWeight > 0.80) {
    dataTier = 'TIER_1_PREMIUM';
  } else if (freshness > 0.70 && verifiedWeight > 0.60) {
    dataTier = 'TIER_2_STANDARD';
  } else if (verifiedWeight > 0.40) {
    dataTier = 'TIER_3_LIMITED';
  } else {
    dataTier = 'TIER_4_INSUFFICIENT';
  }
  
  return {
    overall_risk_score: Math.round(finalScore),
    risk_level: riskLevel,
    confidence_score: Math.round(finalConfidence),
    data_freshness: freshness,
    data_tier: dataTier,
    factor_scores: factorScores,
    critical_flags: criticalFlags,
    warning_flags: warningFlags,
    positive_signals: positiveSignals,
    override_applied: overrideReason !== undefined,
    override_reason: overrideReason,
    calculated_score: Math.round(rawScore), // Show original for transparency
    analyzed_at: new Date().toISOString(),
    data_sources: [
      'Mobula API',
      data.hasGoPlusData ? 'GoPlus Security' : null,
      data.chainType === 'SOLANA' ? 'Helius API' : null,
      data.chainType === 'CARDANO' ? 'Blockfrost API' : null,
      hasAdvancedData ? 'Moralis API' : null
    ].filter(Boolean) as string[]
  };
}
