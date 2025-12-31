/**
 * 9-Factor Risk Algorithm Weights
 * Removed vesting factor, rebalanced for different token types
 */

export enum ChainType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  CARDANO = 'CARDANO'
}

export interface FactorWeights {
  supply_dilution: number;
  holder_concentration: number;
  liquidity_depth: number;
  contract_control: number;
  tax_fee: number;
  distribution: number;
  burn_deflation: number;
  adoption: number;
  audit: number;
}

/**
 * Standard tokens (DeFi, utility tokens)
 * Focus: Supply control, holder distribution, liquidity
 */
export const STANDARD_WEIGHTS: FactorWeights = {
  supply_dilution: 0.18,       // 18% - Most important (inflation risk)
  holder_concentration: 0.20,  // 20% - Whale manipulation + wash trading (INCREASED)
  liquidity_depth: 0.16,       // 16% - Rug pull indicator + liquidity drops
  contract_control: 0.15,      // 15% - Security critical
  tax_fee: 0.11,              // 11% - Hidden fees
  distribution: 0.08,          // 8% - Holder spread (REDUCED - now part of holder_concentration)
  burn_deflation: 0.06,        // 6% - Deflation mechanisms
  adoption: 0.10,              // 10% - Social/on-chain activity
  audit: 0.04                  // 4% - Code verification
};

/**
 * Meme coins (sentiment-driven tokens)
 * Focus: Whales, liquidity, social adoption
 */
export const MEME_WEIGHTS: FactorWeights = {
  supply_dilution: 0.14,       // 14% - Lower - memes often have fixed supply
  holder_concentration: 0.24,  // 24% - HIGHER - whales control meme markets + wash trading
  liquidity_depth: 0.20,       // 20% - HIGHER - rug pulls extremely common + liquidity drops
  contract_control: 0.12,      // 12% - Lower - usually simple contracts
  tax_fee: 0.10,              // 10% - Same - can have high taxes
  distribution: 0.06,          // 6% - Lower - concentration matters more
  burn_deflation: 0.02,        // 2% - LOWER - memes rarely burn
  adoption: 0.15,              // 15% - HIGHER - social hype is critical
  audit: 0.01                  // 1% - LOWER - rarely audited
};

/**
 * Solana-specific weights (CORRECTED - now totals 100%)
 * Focus: Contract control (freeze/mint authority)
 */
export const SOLANA_WEIGHTS: FactorWeights = {
  supply_dilution: 0.12,       // 12% - Normalized from 13%
  holder_concentration: 0.185, // 18.5% - Normalized from 20%
  liquidity_depth: 0.167,      // 16.7% - Normalized from 18%
  contract_control: 0.324,     // 32.4% - Normalized from 35% (still highest priority)
  tax_fee: 0.00,               // 0% - N/A - Solana doesn't have token taxes
  distribution: 0.056,         // 5.6% - Normalized from 6%
  burn_deflation: 0.037,       // 3.7% - Normalized from 4%
  adoption: 0.093,             // 9.3% - Normalized from 10%
  audit: 0.019                 // 1.9% - Normalized from 2%
}; // TOTAL: 100% ✅

/**
 * Cardano-specific weights
 * Focus: Supply policy and distribution
 */
export const CARDANO_WEIGHTS: FactorWeights = {
  supply_dilution: 0.25,       // HIGHER - Policy matters most
  holder_concentration: 0.15,  // Lower - Cardano has better distribution
  liquidity_depth: 0.15,       // Lower - Cardano is safer by design
  contract_control: 0.20,      // Lower - Policy lock is key indicator
  tax_fee: 0.00,               // N/A - No tax mechanism
  distribution: 0.15,          // Higher - Check policy distribution
  burn_deflation: 0.08,        // Standard
  adoption: 0.10,              // Standard
  audit: 0.07                  // Higher - Plutus scripts more audited
};

/**
 * Get weights based on token type and chain (with automatic normalization)
 */
export function getWeights(
  isMeme: boolean,
  chainType: ChainType = ChainType.EVM
): FactorWeights {
  
  let baseWeights: FactorWeights;
  
  // Meme tokens always use meme weights regardless of chain
  if (isMeme) {
    baseWeights = MEME_WEIGHTS;
  } else {
    // Chain-specific weights for utility tokens
    switch (chainType) {
      case ChainType.SOLANA:
        baseWeights = SOLANA_WEIGHTS;
        break;
      case ChainType.CARDANO:
        baseWeights = CARDANO_WEIGHTS;
        break;
      case ChainType.EVM:
      default:
        baseWeights = STANDARD_WEIGHTS;
        break;
    }
  }
  
  // Always normalize to ensure 100% total
  return normalizeWeights(baseWeights);
}

/**
 * Explain why these weights are used
 */
export function getWeightingRationale(
  isMeme: boolean,
  chainType: ChainType
): string {
  
  if (isMeme) {
    return 'Meme token weights: Prioritizes whale concentration (24%), liquidity depth (20%), and social adoption (15%). Meme coins are sentiment-driven and vulnerable to influencer manipulation.';
  }
  
  switch (chainType) {
    case ChainType.SOLANA:
      return 'Solana weights: Prioritizes contract control (32.4%) due to unique freeze/mint authority risks. Solana SPL tokens can have authorities that lock user wallets.';
    
    case ChainType.CARDANO:
      return 'Cardano weights: Prioritizes supply policy (25%) as Cardano uses time-locked minting policies. Once a policy expires or is locked, supply is fixed forever.';
    
    case ChainType.EVM:
    default:
      return 'Standard weights: Balanced approach prioritizing holder concentration (20%), supply dilution (18%), and liquidity depth (16%) for utility tokens.';
  }
}

/**
 * Validate that weights total approximately 100%
 */
function validateWeights(weights: FactorWeights, name: string): void {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const percentage = total * 100;
  
  if (Math.abs(total - 1.0) > 0.01) { // Allow 1% tolerance
    console.warn(`⚠️ [${name}] Weights total ${percentage.toFixed(1)}% (should be 100%)`);
    
    // Log individual weights for debugging
    console.log(`[${name}] Weight breakdown:`);
    for (const [key, value] of Object.entries(weights)) {
      console.log(`  ${key}: ${(value * 100).toFixed(1)}%`);
    }
  } else {
    console.log(`✅ [${name}] Weights validated: ${percentage.toFixed(1)}%`);
  }
}

/**
 * Normalize weights to ensure they total exactly 1.0 (100%)
 */
function normalizeWeights(weights: FactorWeights): FactorWeights {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  if (Math.abs(total - 1.0) < 0.001) {
    // Already normalized (within 0.1% tolerance)
    return weights;
  }
  
  console.log(`[Weights] Normalizing from ${(total * 100).toFixed(1)}% to 100%`);
  
  // Scale all weights proportionally
  const normalized: FactorWeights = {} as FactorWeights;
  for (const [key, value] of Object.entries(weights)) {
    normalized[key as keyof FactorWeights] = value / total;
  }
  
  return normalized;
}

/**
 * Calculate weighted score from individual factor scores
 */
export function calculateWeightedScore(
  factors: Record<string, number>,
  weights: FactorWeights
): number {
  
  let score = 0;
  
  for (const [key, value] of Object.entries(weights)) {
    const factorScore = factors[key] || 0;
    score += factorScore * value;
  }
  
  return Math.round(score);
}
