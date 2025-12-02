/**
 * Enhanced fallback AI summary generator
 * Used when Groq API is unavailable or fails
 */

export function generateEnhancedFallback(tokenData: {
  name: string
  symbol: string
  chain: string
  riskScore: number
  riskLevel: string
  price?: number
  marketCap?: number
  holders?: number
  liquidity?: number
  age?: string
  factors: Array<{ name: string; value: number; description?: string }>
  redFlags?: string[]
  greenFlags?: string[]
}): {
  overview: string
  keyInsights: string[]
  riskAnalysis: string
  recommendation: string
  technicalDetails: string
  calculationBreakdown?: string
} {
  // Build detailed overview
  const mcapText = tokenData.marketCap 
    ? `$${(tokenData.marketCap / 1e6).toFixed(2)}M market cap` 
    : 'unknown market cap'
  const liquidityText = tokenData.liquidity 
    ? `$${(tokenData.liquidity / 1e3).toFixed(2)}K liquidity` 
    : 'limited liquidity'
  const holdersText = tokenData.holders 
    ? `${tokenData.holders.toLocaleString()} holders` 
    : 'unknown holder count'
  
  const overview = `${tokenData.name} (${tokenData.symbol}) is a ${tokenData.chain} token with ${mcapText}, ${liquidityText}, and ${holdersText}. Risk score: ${tokenData.riskScore}/100 (${tokenData.riskLevel}).`
  
  // Build key insights from top risk factors
  const topFactors = [...tokenData.factors].sort((a, b) => b.value - a.value).slice(0, 4)
  const keyInsights = topFactors.map(f => {
    const factorName = f.name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
    if (f.value > 70) return `⚠️ High ${factorName} risk (${f.value}/100)`
    if (f.value > 50) return `⚡ Moderate ${factorName} concern (${f.value}/100)`
    return `✓ Low ${factorName} risk (${f.value}/100)`
  })
  
  // Build risk analysis based on overall score, not individual factors
  let riskAnalysis = ''
  
  if (tokenData.riskScore >= 80) {
    riskAnalysis = `This token presents CRITICAL RISK with a score of ${tokenData.riskScore}/100. `
    const criticalFactors = topFactors.filter(f => f.value > 70)
    if (criticalFactors.length > 0) {
      const names = criticalFactors.map(f => f.name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()).join(', ')
      riskAnalysis += `Major concerns include ${names}. `
    }
  } else if (tokenData.riskScore >= 60) {
    riskAnalysis = `This token presents HIGH RISK with a score of ${tokenData.riskScore}/100. `
    const highFactors = topFactors.filter(f => f.value > 60)
    if (highFactors.length > 0) {
      const names = highFactors.map(f => f.name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()).join(', ')
      riskAnalysis += `Primary concerns are ${names}. `
    }
  } else if (tokenData.riskScore >= 30) {
    riskAnalysis = `This token presents MEDIUM RISK with a score of ${tokenData.riskScore}/100. `
    const moderateFactors = topFactors.filter(f => f.value > 50)
    if (moderateFactors.length > 0) {
      const names = moderateFactors.map(f => f.name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()).join(', ')
      riskAnalysis += `Some concerns exist in ${names}, but overall metrics are acceptable. `
    } else {
      riskAnalysis += `Most risk factors are within acceptable ranges. `
    }
  } else {
    riskAnalysis = `This token presents LOW RISK with a score of ${tokenData.riskScore}/100. `
    const lowFactors = topFactors.filter(f => f.value < 40)
    if (lowFactors.length >= 3) {
      riskAnalysis += `Strong fundamentals across most risk factors. `
    }
    const concernFactors = topFactors.filter(f => f.value > 60)
    if (concernFactors.length > 0) {
      const names = concernFactors.map(f => f.name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()).join(', ')
      riskAnalysis += `Minor concerns in ${names}, but these are outweighed by strong performance in other areas. `
    }
  }
  
  // Add red flags if present
  if (tokenData.redFlags && tokenData.redFlags.length > 0) {
    riskAnalysis += `Critical flags detected: ${tokenData.redFlags.slice(0, 2).join(', ')}. `
  }
  
  riskAnalysis += `Overall assessment: ${tokenData.riskLevel} risk.`
  
  // Build recommendation (matching risk classification thresholds)
  let recommendation = ''
  if (tokenData.riskScore >= 80) {
    recommendation = '🚨 CRITICAL RISK - Avoid investment. This token shows multiple red flags indicating potential scam or rug pull. Do not invest.'
  } else if (tokenData.riskScore >= 60) {
    recommendation = '⚠️ HIGH RISK - Exercise extreme caution. Only invest what you can afford to lose. Conduct thorough research before proceeding.'
  } else if (tokenData.riskScore >= 30) {
    recommendation = '⚡ MEDIUM RISK - Proceed with caution. Standard due diligence required. Consider diversifying to manage risk exposure.'
  } else {
    recommendation = '✓ LOW RISK - Token shows relatively strong fundamentals. Still conduct proper research and risk management.'
  }
  
  // Build technical details
  const ageText = tokenData.age && tokenData.age !== 'Unknown' 
    ? `Age: ${tokenData.age}` 
    : 'Age: Unknown (recently launched or data unavailable)'
  const priceText = tokenData.price ? `, Current Price: $${tokenData.price}` : ''
  const technicalDetails = `${tokenData.chain} blockchain. ${ageText}${priceText}. ${
    tokenData.holders 
      ? `Distributed across ${tokenData.holders.toLocaleString()} wallets.` 
      : 'Holder distribution data limited.'
  }`
  
  // Build calculation breakdown showing the weighted formula
  const weightMap: Record<string, number> = {
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
  
  const sortedFactors = [...tokenData.factors].sort((a, b) => b.value - a.value)
  const calculationLines = sortedFactors.map(f => {
    const factorName = f.name.replace(/([A-Z])/g, ' $1').trim()
    const weight = weightMap[f.name] || 0
    const contribution = (f.value * weight).toFixed(2)
    return `  • ${factorName}: ${f.value}/100 × ${(weight * 100).toFixed(0)}% = ${contribution}`
  })
  
  const totalContribution = sortedFactors.reduce((sum, f) => {
    const weight = weightMap[f.name] || 0
    return sum + (f.value * weight)
  }, 0)
  
  const calculationBreakdown = `Risk Score Calculation:\n\nWeighted Formula:\n${calculationLines.join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBase Score: ${totalContribution.toFixed(2)}/100\nFinal Score: ${tokenData.riskScore}/100 (${tokenData.riskLevel})\n\nNote: Final score may differ from base due to:\n• Chain-specific adjustments (${tokenData.chain})\n• Official token verification (-45 points)\n• Dead token detection (+90 points)\n• Meme token baseline (+15 points)`
  
  return {
    overview,
    keyInsights,
    riskAnalysis,
    recommendation,
    technicalDetails,
    calculationBreakdown
  }
}
