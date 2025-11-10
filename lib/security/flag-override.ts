/**
 * Fixed Critical Flag Logic
 * Graduated penalty system instead of hard override
 */

import { SecurityCheck } from './chain-adapters';

export interface FlagOverrideResult {
  finalScore: number;
  overrideReason?: string;
  overrideApplied: boolean;
}

/**
 * Apply smart flag override with graduated penalties
 * OLD BUG: 1 critical flag = forced to 75
 * NEW FIX: Need multiple serious problems for high score
 */
export function applySmartFlagOverride(
  calculatedScore: number,
  securityChecks: SecurityCheck[]
): FlagOverrideResult {
  
  const criticalCount = securityChecks.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = securityChecks.filter(c => c.severity === 'WARNING').length;
  
  console.log(`[Flag Override] Critical: ${criticalCount}, Warnings: ${warningCount}, Base score: ${calculatedScore}`);
  
  // New graduated system instead of hard override
  if (criticalCount === 0) {
    // No critical issues - use calculated score
    return { 
      finalScore: calculatedScore,
      overrideApplied: false
    };
  } 
  else if (criticalCount === 1) {
    // One critical issue - add penalty but don't force to 75
    const finalScore = Math.min(calculatedScore + 15, 100);
    console.log(`[Flag Override] 1 critical flag - adding 15 point penalty: ${calculatedScore} -> ${finalScore}`);
    return {
      finalScore,
      overrideReason: '1 critical flag detected - added 15 point penalty',
      overrideApplied: finalScore !== calculatedScore
    };
  } 
  else if (criticalCount === 2) {
    // Two critical issues - force to HIGH risk minimum
    const penaltyScore = calculatedScore + 25;
    const finalScore = Math.max(penaltyScore, 65);
    console.log(`[Flag Override] 2 critical flags - elevated to HIGH risk: ${calculatedScore} -> ${finalScore}`);
    return {
      finalScore: Math.min(finalScore, 100),
      overrideReason: '2 critical flags detected - elevated to HIGH risk (minimum 65)',
      overrideApplied: true
    };
  } 
  else {
    // Three or more - force to CRITICAL
    const finalScore = Math.max(calculatedScore + 35, 75);
    console.log(`[Flag Override] ${criticalCount} critical flags - forced to CRITICAL: ${calculatedScore} -> ${finalScore}`);
    return {
      finalScore: Math.min(finalScore, 100),
      overrideReason: `${criticalCount} critical flags detected - elevated to CRITICAL risk (minimum 75)`,
      overrideApplied: true
    };
  }
}

/**
 * Get explanation of override logic
 */
export function getOverrideExplanation(): string {
  return `
Smart Flag Override Logic:
- 0 critical flags: Use calculated score
- 1 critical flag: +15 point penalty
- 2 critical flags: Minimum score 65 (HIGH risk)
- 3+ critical flags: Minimum score 75 (CRITICAL risk)

This prevents false positives while catching serious issues.
  `.trim();
}
