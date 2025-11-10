import { TokenData, RiskResult, RiskBreakdown } from './types/token-data'
import { detectMemeTokenWithAI, generateAIExplanation } from './ai/gemini'
import { getTwitterAdoptionData, calculateAdoptionRisk } from './twitter/adoption'
import { getWeights, ChainType } from './risk-factors/weights'

const WEIGHTS = {
  supplyDilution: 0.18,
  holderConcentration: 0.16,
  liquidityDepth: 0.14,
  vestingUnlock: 0.13,
  contractControl: 0.12,
  taxFee: 0.10,
  distribution: 0.09,
  burnDeflation: 0.08,
  adoption: 0.07,
  auditTransparency: 0.03
}

/**
 * Calculate token risk using a unified 10-factor algorithm for both FREE and PREMIUM plans.
 * Enhanced with AI meme detection, Twitter metrics, and chain-adaptive weights.
 */
export async function calculateRisk(
  data: TokenData,
  plan: 'FREE' | 'PREMIUM',
  metadata?: {
    tokenSymbol?: string
    tokenName?: string
    tokenDescription?: string
    twitterHandle?: string
    chain?: ChainType
    manualClassification?: 'MEME_TOKEN' | 'UTILITY_TOKEN' | null
  }
): Promise<RiskResult> {
  const hasGoPlus = data.is_honeypot !== undefined

  console.log(`\n🔬 [Tokenomics Lab] Starting calculation - Plan: ${plan}, GoPlus: ${hasGoPlus ? 'ACTIVE' : 'FALLBACK'}`)
  
  // ═══════════════════════════════════════════════════════════
  // STEP 1: AI MEME DETECTION → SELECT WEIGHT PROFILE
  // ═══════════════════════════════════════════════════════════
  
  let memeDetection = { isMeme: false, confidence: 0, reasoning: '' }
  let useNewWeights = false
  let isManualOverride = false
  
  // Check for manual classification override
  if (metadata?.manualClassification) {
    console.log(`👤 [User Override] Manual classification: ${metadata.manualClassification}`)
    memeDetection = {
      isMeme: metadata.manualClassification === 'MEME_TOKEN',
      confidence: 100,
      reasoning: 'Manual classification by user'
    }
    useNewWeights = true
    isManualOverride = true
  } else if (metadata?.tokenSymbol || metadata?.tokenName) {
    try {
      console.log(`🤖 [AI] Detecting meme token...`)
      memeDetection = await detectMemeTokenWithAI(
        { symbol: metadata.tokenSymbol, name: metadata.tokenName },
        metadata
      )
      console.log(`✓ Classification: ${memeDetection.isMeme ? 'MEME' : 'UTILITY'} (${memeDetection.confidence}% confident)`)
      useNewWeights = true
    } catch (error) {
      console.log(`⚠ AI detection failed, using fallback`)
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // STEP 2: TWITTER SOCIAL METRICS → ADOPTION SCORING
  // ═══════════════════════════════════════════════════════════
  
  let twitterAdoptionScore: number | null = null
  let twitterMetrics: any = null
  
  if (metadata?.tokenSymbol && metadata?.twitterHandle) {
    try {
      console.log(`🐦 [Twitter] Fetching social metrics...`)
      const twitterData = await getTwitterAdoptionData(
        metadata.tokenSymbol,
        metadata.twitterHandle
      )
      twitterAdoptionScore = calculateAdoptionRisk(twitterData, data.holderCount)
      twitterMetrics = twitterData // Store for later
      console.log(`✓ Twitter Adoption Score: ${twitterAdoptionScore}/100`)
    } catch (error) {
      console.log(`⚠ Twitter API unavailable, using fallback adoption`)
    }
  }

  console.log(`[Risk Calc] Token Data:`, {
    marketCap: data.marketCap,
    fdv: data.fdv,
    liquidityUSD: data.liquidityUSD,
    holderCount: data.holderCount,
    top10HoldersPct: data.top10HoldersPct,
    volume24h: data.volume24h,
    txCount24h: data.txCount24h,
    ageDays: data.ageDays,
    totalSupply: data.totalSupply,
    circulatingSupply: data.circulatingSupply
  })

  // ALWAYS CALCULATE ALL 10 FACTORS
  const scores: RiskBreakdown = {
    supplyDilution: calcSupplyDilution(data),
    holderConcentration: calcHolderConcentration(data),
    liquidityDepth: calcLiquidityDepth(data, hasGoPlus),
    vestingUnlock: calcVestingUnlock(data),
    contractControl: calcContractControl(data, hasGoPlus),
    taxFee: calcTaxFee(data, hasGoPlus),
    distribution: calcDistribution(data),
    burnDeflation: calcBurnDeflation(data),
    adoption: twitterAdoptionScore !== null ? twitterAdoptionScore : calcAdoption(data),
    auditTransparency: calcAuditTransparency(data, hasGoPlus)
  }

  console.log(`[Risk Calc] Individual Scores:`, scores)

  // ═══════════════════════════════════════════════════════════
  // STEP 3: WEIGHTED OVERALL SCORE (with chain-adaptive weights)
  // ═══════════════════════════════════════════════════════════
  
  let overallScoreRaw: number
  
  if (useNewWeights) {
    // Use new 9-factor weighted system
    const chain = metadata?.chain || ChainType.EVM
    const weights = getWeights(memeDetection.isMeme, chain)
    
    // Calculate weighted score (9 factors, excluding vesting)
    overallScoreRaw = 
      scores.supplyDilution * weights.supply_dilution +
      scores.holderConcentration * weights.holder_concentration +
      scores.liquidityDepth * weights.liquidity_depth +
      scores.contractControl * weights.contract_control +
      scores.taxFee * weights.tax_fee +
      scores.distribution * weights.distribution +
      scores.burnDeflation * weights.burn_deflation +
      scores.adoption * weights.adoption +
      scores.auditTransparency * weights.audit
    
    console.log(`⚖️ [New Weights] Using ${memeDetection.isMeme ? 'MEME' : 'STANDARD'} + ${chain} profile`)
    
    // MEME BASELINE: Meme tokens start at 50-60 baseline
    if (memeDetection.isMeme) {
      const memeBaseline = 55
      overallScoreRaw = Math.max(overallScoreRaw, memeBaseline)
      console.log(`✓ Meme Baseline Applied: min ${memeBaseline}`)
    }
  } else {
    // Use legacy 10-factor weighted system
    overallScoreRaw = Object.entries(scores).reduce(
      (sum, [key, value]) => sum + value * (WEIGHTS as any)[key],
      0
    )
  }

  console.log(`[Risk Calc] Overall Score (raw): ${overallScoreRaw.toFixed(2)}`)

  const riskLevel = classifyRisk(overallScoreRaw)
  const confidenceScore = hasGoPlus
    ? (plan === 'PREMIUM' ? 96 : 85)
    : (plan === 'PREMIUM' ? 78 : 70)

  const overallRounded = Math.round(overallScoreRaw)

  const baseResult = {
    overall_risk_score: overallRounded,
    risk_level: riskLevel,
    confidence_score: confidenceScore,
    data_sources: hasGoPlus ? ['Mobula', 'GoPlus Security'] : ['Mobula (GoPlus fallback active)'],
    goplus_status: hasGoPlus ? 'active' as const : 'fallback' as const,
    plan
  }

  // FREE PLAN - Show all 10 factors too
  if (plan === 'FREE') {
    return {
      ...baseResult,
      breakdown: scores,
      upgrade_message:
        overallRounded > 40
          ? '⚡ Premium unlocks forecasts, critical flags, and detailed insights'
          : undefined
    }
  }

  // PREMIUM PLAN - Show everything
  const result: RiskResult = {
    ...baseResult,
    breakdown: scores,
    critical_flags: extractCriticalFlags(data, hasGoPlus),
    upcoming_risks: calculateUpcomingRisks(data),
    detailed_insights: generateInsights(scores, data, hasGoPlus)
  }
  
  // ═══════════════════════════════════════════════════════════
  // STEP 4: ADD MEME DETECTION TO INSIGHTS (PREMIUM only)
  // ═══════════════════════════════════════════════════════════
  
  if (plan === 'PREMIUM' && useNewWeights) {
    // Add structured AI insights
    result.ai_insights = {
      classification: memeDetection.isMeme ? 'MEME_TOKEN' : 'UTILITY_TOKEN',
      confidence: memeDetection.confidence,
      reasoning: isManualOverride ? 'Manual classification by user' : memeDetection.reasoning,
      meme_baseline_applied: memeDetection.isMeme,
      is_manual_override: isManualOverride
    }
    
    // Add meme detection insight to detailed_insights (for backward compatibility)
    const classificationPrefix = isManualOverride ? '👤 Manual Classification' : '🤖 AI Classification'
    if (memeDetection.isMeme) {
      result.detailed_insights = [
        `${classificationPrefix}: MEME TOKEN (${memeDetection.confidence}% confident) - ${memeDetection.reasoning}`,
        `⚠️ Meme Baseline Applied: Minimum risk score set to 55 due to speculative nature`,
        ...(result.detailed_insights || [])
      ]
    } else {
      result.detailed_insights = [
        `${classificationPrefix}: UTILITY TOKEN (${memeDetection.confidence}% confident) - ${memeDetection.reasoning}`,
        ...(result.detailed_insights || [])
      ]
    }
    
    // Add Twitter metrics if available
    if (twitterMetrics && twitterAdoptionScore !== null) {
      result.twitter_metrics = {
        followers: twitterMetrics.followersCount || 0,
        engagement_rate: twitterMetrics.engagementRate || 0,
        tweets_7d: twitterMetrics.tweetsLast7Days || 0,
        adoption_score: twitterAdoptionScore,
        handle: metadata?.twitterHandle || ''
      }
      
      result.detailed_insights.push(
        `🐦 Twitter Metrics: Adoption risk score ${twitterAdoptionScore}/100 based on social presence`
      )
    }
    
    console.log(`✓ Enhanced insights added`)
  }
  
  console.log(`✅ Risk calculation complete!\n`)
  
  return result
}

function classifyRisk(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 30) return 'MEDIUM'
  return 'LOW'
}

// FACTOR 1: Supply Dilution (Pure Mobula - no fallback needed)
function calcSupplyDilution(data: TokenData): number {
  let score = 0
  
  // FDV vs Market Cap ratio (unlocked vs locked tokens)
  if (data.fdv > 0 && data.marketCap > 0) {
    const mcFdvRatio = data.marketCap / data.fdv
    if (mcFdvRatio < 0.02) score += 38 // Less than 2% circulating = extreme dilution risk
    else if (mcFdvRatio < 0.05) score += 32
    else if (mcFdvRatio < 0.10) score += 27
    else if (mcFdvRatio < 0.15) score += 22
    else if (mcFdvRatio < 0.25) score += 17
    else if (mcFdvRatio < 0.35) score += 12
    else if (mcFdvRatio < 0.50) score += 7
  } else {
    score += 15 // No FDV data = some uncertainty
  }

  // Circulating supply ratio
  if (data.totalSupply > 0) {
    const circRatio = data.circulatingSupply / data.totalSupply
    if (circRatio < 0.05) score += 32
    else if (circRatio < 0.10) score += 26
    else if (circRatio < 0.20) score += 21
    else if (circRatio < 0.30) score += 16
    else if (circRatio < 0.40) score += 11
    else if (circRatio < 0.50) score += 6
  }

  // Unlimited supply with no burns
  if (!data.maxSupply && data.burnedSupply === 0) score += 22
  else if (!data.maxSupply && data.burnedSupply > 0) score += 10 // Some burns help

  return Math.min(score, 100)
}

// FACTOR 2: Holder Concentration (Pure Mobula)
function calcHolderConcentration(data: TokenData): number {
  let score = 0
  
  // If no holder data available, return moderate risk
  if (!data.holderCount && !data.top10HoldersPct) {
    return 50 // Unknown - moderate risk
  }
  
  // Top 10 holders concentration
  if (data.top10HoldersPct > 0.8) score += 50
  else if (data.top10HoldersPct > 0.7) score += 40
  else if (data.top10HoldersPct > 0.6) score += 35
  else if (data.top10HoldersPct > 0.5) score += 28
  else if (data.top10HoldersPct > 0.4) score += 20
  else if (data.top10HoldersPct > 0.3) score += 12
  else if (data.top10HoldersPct > 0.2) score += 5

  // Holder count risk
  if (data.holderCount === 0) score += 40 // No data
  else if (data.holderCount < 50) score += 35
  else if (data.holderCount < 100) score += 30
  else if (data.holderCount < 200) score += 25
  else if (data.holderCount < 500) score += 18
  else if (data.holderCount < 1000) score += 10
  else if (data.holderCount < 5000) score += 5

  return Math.min(score, 100)
}

// FACTOR 3: Liquidity Depth (Mobula + GoPlus bonus)
function calcLiquidityDepth(data: TokenData, hasGoPlus: boolean): number {
  let score = 0
  
  // CRITICAL FIX: If no liquidity data, default to HIGH RISK (not 0)
  if (!data.liquidityUSD || data.liquidityUSD === 0) {
    console.warn('[Liquidity] Missing liquidity data - defaulting to HIGH RISK (85)')
    return 85 // ⚠️ No liquidity data = very high risk
  }
  
  // Absolute liquidity amount
  if (data.liquidityUSD < 1000) score += 50
  else if (data.liquidityUSD < 5000) score += 42
  else if (data.liquidityUSD < 10000) score += 36
  else if (data.liquidityUSD < 25000) score += 28
  else if (data.liquidityUSD < 50000) score += 22
  else if (data.liquidityUSD < 100000) score += 15
  else if (data.liquidityUSD < 250000) score += 8
  else if (data.liquidityUSD < 500000) score += 3

  // Market cap to liquidity ratio (if market cap available)
  if (data.marketCap > 0 && data.liquidityUSD > 0) {
    const mcLiqRatio = data.marketCap / data.liquidityUSD
    console.log(`[Liquidity] MC/Liq Ratio: ${mcLiqRatio.toFixed(2)}x (MC: $${(data.marketCap/1e6).toFixed(2)}M, Liq: $${(data.liquidityUSD/1e3).toFixed(2)}K)`)
    
    if (mcLiqRatio > 500) score += 38
    else if (mcLiqRatio > 300) score += 32
    else if (mcLiqRatio > 200) score += 28
    else if (mcLiqRatio > 100) score += 22
    else if (mcLiqRatio > 50) score += 15
    else if (mcLiqRatio > 20) score += 8
  }

  // GoPlus LP lock bonus/penalty
  if (hasGoPlus && !data.lp_locked) score += 20
  if (hasGoPlus && data.lp_locked) score -= 5 // Reduce risk if locked

  const finalScore = Math.min(score, 100)
  console.log(`[Liquidity] Final score: ${finalScore}`)
  return finalScore
}

// FACTOR 4: Vesting & Unlock (Pure Mobula)
function calcVestingUnlock(data: TokenData): number {
  let score = 0
  if (data.nextUnlock30dPct) {
    if (data.nextUnlock30dPct > 0.25) score += 30
    else if (data.nextUnlock30dPct > 0.15) score += 20
    else if (data.nextUnlock30dPct > 0.1) score += 15
    else if (data.nextUnlock30dPct > 0.05) score += 10
  }

  if (data.teamVestingMonths !== undefined) {
    if (data.teamVestingMonths === 0 && (data.teamAllocationPct || 0) > 0.1) {
      score += 40
    } else if (data.teamVestingMonths < 12) {
      score += 25
    } else if (data.teamVestingMonths < 24) {
      score += 15
    }
  }
  return Math.min(score, 100)
}

// FACTOR 5: Contract Control (GoPlus PRIMARY, fallback to proxies)
function calcContractControl(data: TokenData, hasGoPlus: boolean): number {
  if (hasGoPlus) {
    let score = 0
    
    // Critical: Honeypot = instant max risk
    if (data.is_honeypot) return 100
    
    console.log(`[Contract Control] is_mintable=${data.is_mintable}, owner_renounced=${data.owner_renounced}, marketCap=$${(data.marketCap / 1e9).toFixed(1)}B`)
    
    // OVERRIDE: Large cap tokens (>$50B) are considered safe even if upgradeable
    // Examples: USDT, USDC, ETH - proxy contracts but battle-tested
    if (data.marketCap > 50_000_000_000) {
      console.log(`[Contract Control] Large cap override: $${(data.marketCap / 1e9).toFixed(1)}B > $50B = 0`)
      return 0
    }
    
    // SAFE: Renounced ownership + non-mintable = very safe (e.g., PEPE)
    if (data.owner_renounced && !data.is_mintable) {
      console.log(`[Contract Control] Safe token: Renounced + Non-mintable = 0`)
      return 0  // No control risk
    }
    
    // RISKY: Mintable with active owner
    if (data.is_mintable && !data.owner_renounced) {
      console.log(`[Contract Control] High risk: Mintable + Active owner = +60`)
      score += 60
    }
    
    // MODERATE: Active owner but not mintable  
    if (!data.owner_renounced && !data.is_mintable) {
      console.log(`[Contract Control] Moderate risk: Active owner but not mintable = +30`)
      score += 30
    }
    
    console.log(`[Contract Control] Final score: ${score}`)
    return Math.min(score, 100)
  }
  // FALLBACK: Use Mobula proxies
  let score = 20 // Base uncertainty penalty
  if (data.top10HoldersPct > 0.8) score += 35
  if (data.holderCount < 100) score += 25
  if (data.ageDays < 7) score += 20
  return Math.min(score, 100)
}

// FACTOR 6: Tax & Fee (GoPlus PRIMARY, fallback to neutral)
function calcTaxFee(data: TokenData, hasGoPlus: boolean): number {
  if (hasGoPlus) {
    let score = 0
    if ((data.sell_tax || 0) > 0.3) score += 60
    else if ((data.sell_tax || 0) > 0.2) score += 40
    else if ((data.sell_tax || 0) > 0.1) score += 20

    if ((data.buy_tax || 0) > 0.15) score += 20
    if (data.tax_modifiable) score += 30
    return Math.min(score, 100)
  }
  return 50 // Neutral - cannot determine without GoPlus
}

// FACTOR 7: Distribution (Pure Mobula)
function calcDistribution(data: TokenData): number {
  let score = 0
  
  // CRITICAL FIX: Default estimate of 0.5 means we don't have real data
  const hasRealData = data.top10HoldersPct !== 0.5 || data.teamAllocationPct
  
  if (!hasRealData) {
    console.warn('[Distribution] No real holder distribution data (using default 0.5) - defaulting to 65')
    return 65 // ⚠️ Unknown distribution = assume concentrated (risky)
  }
  
  // Team allocation risk
  if (data.teamAllocationPct) {
    if (data.teamAllocationPct > 0.4) score += 35
    else if (data.teamAllocationPct > 0.3) score += 25
    else if (data.teamAllocationPct > 0.2) score += 15
  }
  
  // Top 10 holders concentration (more important)
  if (data.top10HoldersPct > 0) {
    console.log(`[Distribution] Top 10 holders: ${(data.top10HoldersPct * 100).toFixed(1)}%`)
    
    if (data.top10HoldersPct >= 0.80) score += 55 // 80%+ = EXTREME
    else if (data.top10HoldersPct >= 0.70) score += 45 // 70%+ = VERY HIGH
    else if (data.top10HoldersPct >= 0.60) score += 35 // 60%+ = HIGH
    else if (data.top10HoldersPct >= 0.50) score += 25 // 50%+ = MEDIUM-HIGH (includes default 0.5)
    else if (data.top10HoldersPct >= 0.40) score += 15 // 40%+ = MEDIUM
    else if (data.top10HoldersPct >= 0.30) score += 8  // 30%+ = LOW-MEDIUM
  }
  
  const finalScore = Math.min(score, 100)
  console.log(`[Distribution] Final score: ${finalScore}`)
  return finalScore
}

// FACTOR 8: Burn & Deflation (Pure Mobula)
function calcBurnDeflation(data: TokenData): number {
  // If supply data missing, return moderate uncertainty
  if (!data.totalSupply || data.totalSupply === 0) return 50
  
  // Check if max supply exists (capped supply is safer)
  const hasCappedSupply = data.maxSupply && data.maxSupply > 0
  
  // If no capped supply AND no burns = high risk
  if (!hasCappedSupply && (data.burnedSupply === 0 || !data.burnedSupply)) return 80
  
  // Calculate burn ratio
  const burnRatio = data.burnedSupply / data.totalSupply
  
  // High burn rate scenarios
  if (burnRatio > 0.5) return 10  // Over 50% burned = very low risk
  if (burnRatio > 0.2) return 30  // Over 20% burned = low risk
  if (burnRatio > 0.05) return 50 // Over 5% burned = medium risk
  
  // Capped supply with low/no burns
  if (hasCappedSupply && burnRatio < 0.05) return 40 // Capped but not burning much
  
  // No burns but capped supply
  if (hasCappedSupply && burnRatio === 0) return 60
  
  return 70 // Default moderate-high risk
}

// FACTOR 9: Adoption & Usage (Pure Mobula)
function calcAdoption(data: TokenData): number {
  let score = 0
  
  // Transaction volume (24h)
  if (data.txCount24h === 0) score += 45 // No transactions = high risk
  else if (data.txCount24h < 5) score += 38
  else if (data.txCount24h < 10) score += 32
  else if (data.txCount24h < 25) score += 26
  else if (data.txCount24h < 50) score += 20
  else if (data.txCount24h < 100) score += 14
  else if (data.txCount24h < 250) score += 8
  else if (data.txCount24h < 500) score += 3

  // Volume to market cap ratio
  if (data.marketCap > 0 && data.volume24h >= 0) {
    const volMcRatio = data.volume24h / data.marketCap
    if (volMcRatio < 0.0001) score += 32 // Dead token
    else if (volMcRatio < 0.001) score += 26
    else if (volMcRatio < 0.005) score += 20
    else if (volMcRatio < 0.01) score += 14
    else if (volMcRatio > 5) score += 25 // Excessive volatility
    else if (volMcRatio > 3) score += 18
    else if (volMcRatio > 2) score += 12
  }

  // Age factor
  if (data.ageDays < 1) score += 22
  else if (data.ageDays < 3) score += 16
  else if (data.ageDays < 7) score += 12
  else if (data.ageDays < 14) score += 8
  else if (data.ageDays < 30) score += 4
  
  return Math.min(score, 100)
}

// FACTOR 10: Audit & Transparency (GoPlus PRIMARY, fallback to moderate)
function calcAuditTransparency(data: TokenData, hasGoPlus: boolean): number {
  if (hasGoPlus) {
    let score = 0
    if (!data.is_open_source) score += 50
    if (!data.lp_locked) score += 30
    return Math.min(score, 100)
  }
  // FALLBACK
  let score = 60
  const mcLiqRatio = data.marketCap / data.liquidityUSD
  if (mcLiqRatio > 100) score += 20
  return Math.min(score, 100)
}

function extractCriticalFlags(data: TokenData, hasGoPlus: boolean): string[] {
  const flags: string[] = []
  if (hasGoPlus) {
    if (data.is_honeypot) flags.push('🚨 HONEYPOT DETECTED - Cannot sell')
    if (data.is_mintable && !data.owner_renounced) flags.push('⚠️ Owner can mint unlimited tokens')
    if (data.tax_modifiable) flags.push('⚠️ Taxes can be changed anytime')
    if ((data.sell_tax || 0) > 0.2) flags.push(`⚠️ High sell tax: ${(((data.sell_tax || 0) * 100)).toFixed(0)}%`)
    if (!data.lp_locked) flags.push('⚠️ Liquidity not locked')
  }
  if (data.nextUnlock30dPct && data.nextUnlock30dPct > 0.15) {
    flags.push(`📅 ${(data.nextUnlock30dPct * 100).toFixed(1)}% unlocking in 30 days`)
  }
  if (data.top10HoldersPct > 0.7) {
    flags.push(`👥 ${(data.top10HoldersPct * 100).toFixed(0)}% held by top 10 wallets`)
  }
  return flags
}

function calculateUpcomingRisks(data: TokenData) {
  const unlockPct = data.nextUnlock30dPct || 0
  return {
    next_30_days: unlockPct,
    forecast: unlockPct > 0.3 ? 'EXTREME' : unlockPct > 0.15 ? 'HIGH' : unlockPct > 0.05 ? 'MEDIUM' : 'LOW'
  } as const
}

function generateInsights(scores: RiskBreakdown, data: TokenData, hasGoPlus: boolean): string[] {
  const insights: string[] = []
  if (scores.contractControl > 70) {
    insights.push(
      hasGoPlus
        ? 'Contract has high risk features (honeypot, mintable, or no renouncement)'
        : 'Contract shows centralization patterns - verification unavailable'
    )
  }
  if (scores.liquidityDepth > 60) {
    insights.push('Low liquidity creates high slippage risk')
  }
  if (scores.vestingUnlock > 60) {
    insights.push('Major token unlocks expected soon - high sell pressure')
  }
  if (scores.holderConcentration > 60) {
    insights.push('Whale concentration risk - few holders control most supply')
  }
  return insights
}


