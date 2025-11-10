/**
 * Smart Risk Weighting System
 * Different blockchains have different risk profiles
 */

import { ChainType } from './chain-adapters';

export interface FactorWeights {
  contract_security: number;
  supply_risk: number;
  concentration_risk: number;
  liquidity_risk: number;
  market_activity: number;
  deflation_mechanics: number;
  token_age: number;
}

/**
 * Get chain-specific weights for risk calculation
 * Different chains prioritize different risk factors
 */
export function getChainWeights(chainType: ChainType): FactorWeights {
  switch (chainType) {
    case ChainType.SOLANA:
      // Solana has unique critical risks (freeze authority, mint authority)
      // Contract security matters most
      return {
        contract_security: 0.35,  // HIGHEST - Solana has unique critical risks
        supply_risk: 0.15,
        concentration_risk: 0.12,
        liquidity_risk: 0.18,
        market_activity: 0.10,
        deflation_mechanics: 0.05,
        token_age: 0.05
      };
      
    case ChainType.EVM:
      // EVM chains have honeypots, taxes, proxy contracts
      // Balanced approach across all factors
      return {
        contract_security: 0.25,  // STANDARD - Balanced approach
        supply_risk: 0.20,
        concentration_risk: 0.10,
        liquidity_risk: 0.18,
        market_activity: 0.12,
        deflation_mechanics: 0.08,
        token_age: 0.07
      };
      
    case ChainType.CARDANO:
      // Cardano is safer by design (no reentrancy, clear policies)
      // Supply policy matters most
      return {
        contract_security: 0.20,  // LOWER - Cardano is safer by design
        supply_risk: 0.25,        // HIGHER - Policy matters more
        concentration_risk: 0.15,
        liquidity_risk: 0.15,
        market_activity: 0.10,
        deflation_mechanics: 0.08,
        token_age: 0.07
      };
      
    default:
      // Fallback to EVM weights
      return {
        contract_security: 0.25,
        supply_risk: 0.20,
        concentration_risk: 0.10,
        liquidity_risk: 0.18,
        market_activity: 0.12,
        deflation_mechanics: 0.08,
        token_age: 0.07
      };
  }
}

/**
 * Calculate final risk score using chain-specific weights
 */
export function calculateWeightedRiskScore(
  factorScores: Record<string, number>,
  chainType: ChainType
): number {
  const weights = getChainWeights(chainType);
  
  const weightedScore = 
    (factorScores.contract_security * weights.contract_security) +
    (factorScores.supply_risk * weights.supply_risk) +
    (factorScores.concentration_risk * weights.concentration_risk) +
    (factorScores.liquidity_risk * weights.liquidity_risk) +
    (factorScores.market_activity * weights.market_activity) +
    (factorScores.deflation_mechanics * weights.deflation_mechanics) +
    (factorScores.token_age * weights.token_age);
  
  return Math.round(weightedScore);
}

/**
 * Get explanation of why these weights are used for this chain
 */
export function getWeightingRationale(chainType: ChainType): string {
  switch (chainType) {
    case ChainType.SOLANA:
      return 'Solana prioritizes contract security (35%) due to unique risks like freeze authority that can lock wallets.';
    case ChainType.EVM:
      return 'EVM chains use balanced weighting (25% security) accounting for honeypots, taxes, and proxy contracts.';
    case ChainType.CARDANO:
      return 'Cardano emphasizes supply policy (25%) as minting rules are most critical on this chain.';
    default:
      return 'Standard balanced risk weighting applied.';
  }
}
