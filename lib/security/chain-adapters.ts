/**
 * Chain-Specific Security Adapters
 * Each blockchain has unique risks that require different checks
 */

export enum ChainType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  CARDANO = 'CARDANO'
}

export interface SecurityCheck {
  name: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  score: number; // How much to add to risk score
}

// ============================================================================
// EVM Security Adapter (Ethereum, BSC, Polygon, etc.)
// ============================================================================
export async function checkEVMSecurity(
  tokenAddress: string,
  chainId: number
): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = [];
  
  try {
    // Call GoPlus API for EVM chains
    const response = await fetch(
      `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    const token = data.result?.[tokenAddress.toLowerCase()];
    
    if (!token) {
      console.log('[EVM Security] No data from GoPlus');
      return checks;
    }
    
    console.log('[EVM Security] Running checks for', tokenAddress);
    
    // CHECK 1: Honeypot (can you sell the token?)
    if (token.is_honeypot === '1') {
      checks.push({
        name: 'Honeypot Detected',
        severity: 'CRITICAL',
        message: '🚨 HONEYPOT - You cannot sell this token',
        score: 95
      });
    }
    
    // CHECK 2: High Sell Tax
    const sellTax = parseFloat(token.sell_tax || '0');
    if (sellTax > 0.50) {
      checks.push({
        name: 'Extreme Sell Tax',
        severity: 'CRITICAL',
        message: `🚨 ${(sellTax * 100).toFixed(0)}% sell tax - Exit blocked`,
        score: 80
      });
    } else if (sellTax > 0.20) {
      checks.push({
        name: 'High Sell Tax',
        severity: 'WARNING',
        message: `⚠️ ${(sellTax * 100).toFixed(0)}% sell tax`,
        score: 40
      });
    }
    
    // CHECK 3: Owner Can Mint Tokens
    if (token.is_mintable === '1' && token.owner_address && token.owner_address !== '0x0000000000000000000000000000000000000000') {
      checks.push({
        name: 'Mintable',
        severity: 'WARNING',
        message: '⚠️ Owner can create unlimited tokens',
        score: 50
      });
    }
    
    // CHECK 4: Proxy Contract (can be upgraded)
    if (token.is_proxy === '1') {
      checks.push({
        name: 'Proxy Contract',
        severity: 'WARNING',
        message: '⚠️ Contract logic can be changed',
        score: 35
      });
    }
    
    // CHECK 5: Owner Not Renounced
    if (token.owner_address && token.owner_address !== '0x0000000000000000000000000000000000000000') {
      checks.push({
        name: 'Owner Exists',
        severity: 'INFO',
        message: 'ℹ️ Owner has not renounced control',
        score: 20
      });
    }
    
    // CHECK 6: Cannot Buy
    if (token.cannot_buy === '1') {
      checks.push({
        name: 'Cannot Buy',
        severity: 'CRITICAL',
        message: '🚨 Trading is disabled - Cannot buy',
        score: 95
      });
    }
    
    console.log(`[EVM Security] ✅ Found ${checks.length} security issues`);
    
  } catch (error) {
    console.error('❌ EVM security check failed:', error);
  }
  
  return checks;
}

// ============================================================================
// Solana Security Adapter
// ============================================================================
export async function checkSolanaSecurity(
  tokenAddress: string
): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = [];
  
  try {
    // Call Helius API for Solana
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      console.log('[Solana Security] No Helius API key configured');
      return checks;
    }
    
    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [tokenAddress] })
      }
    );
    
    const data = await response.json();
    const token = data[0];
    
    if (!token) {
      console.log('[Solana Security] No data from Helius');
      return checks;
    }
    
    console.log('[Solana Security] Running checks for', tokenAddress);
    
    // CHECK 1: Freeze Authority (UNIQUE TO SOLANA - MOST DANGEROUS)
    if (token.freezeAuthority && token.freezeAuthority !== null) {
      checks.push({
        name: 'Freeze Authority',
        severity: 'CRITICAL',
        message: '🚨 FREEZE AUTHORITY - Creator can lock your wallet',
        score: 90
      });
    }
    
    // CHECK 2: Mint Authority (context-dependent)
    if (token.mintAuthority && token.mintAuthority !== null) {
      const tokenAge = token.deployedDaysAgo || 0;
      
      if (tokenAge < 90) {
        checks.push({
          name: 'Mint Authority (New Token)',
          severity: 'CRITICAL',
          message: '🚨 Unlimited minting possible on new token',
          score: 60
        });
      } else {
        checks.push({
          name: 'Mint Authority (Old Token)',
          severity: 'WARNING',
          message: '⚠️ Mint authority exists but token is established',
          score: 25
        });
      }
    }
    
    // CHECK 3: Program Upgrade Authority
    if (token.programAuthority && token.programAuthority !== null) {
      checks.push({
        name: 'Upgradeable Program',
        severity: 'WARNING',
        message: '⚠️ Program can be upgraded',
        score: 40
      });
    }
    
    console.log(`[Solana Security] ✅ Found ${checks.length} security issues`);
    
  } catch (error) {
    console.error('❌ Solana security check failed:', error);
  }
  
  return checks;
}

// ============================================================================
// Cardano Security Adapter
// ============================================================================
export async function checkCardanoSecurity(
  tokenAddress: string
): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = [];
  
  try {
    // Call Blockfrost API for Cardano
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) {
      console.log('[Cardano Security] No Blockfrost API key configured');
      return checks;
    }
    
    const response = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/assets/${tokenAddress}`,
      {
        headers: { 'project_id': apiKey }
      }
    );
    
    const asset = await response.json();
    
    if (!asset || asset.error) {
      console.log('[Cardano Security] No data from Blockfrost');
      return checks;
    }
    
    console.log('[Cardano Security] Running checks for', tokenAddress);
    
    // Get policy info
    const policyResponse = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/scripts/${asset.policy_id}`,
      {
        headers: { 'project_id': apiKey }
      }
    );
    
    const policy = await policyResponse.json();
    
    // CHECK 1: Minting Policy Not Locked
    if (policy.type === 'plutusV2' || policy.type === 'plutusV1') {
      // Plutus scripts can mint indefinitely
      checks.push({
        name: 'Unlocked Policy',
        severity: 'CRITICAL',
        message: '🚨 Smart contract can mint unlimited tokens',
        score: 70
      });
    } else if (policy.type === 'timelock') {
      // Check if timelock has expired
      const currentSlot = Date.now() / 1000; // Approximate
      if (policy.valid_contract && !policy.valid_contract.expired) {
        checks.push({
          name: 'Policy Not Expired',
          severity: 'WARNING',
          message: '⚠️ Time lock not yet expired',
          score: 20
        });
      } else {
        // Good! Policy is locked AND expired
        checks.push({
          name: 'Policy Locked',
          severity: 'INFO',
          message: '✅ Supply is permanently fixed',
          score: 0
        });
      }
    }
    
    console.log(`[Cardano Security] ✅ Found ${checks.length} security issues`);
    
  } catch (error) {
    console.error('❌ Cardano security check failed:', error);
  }
  
  return checks;
}

// ============================================================================
// Utility: Detect chain type from chain ID
// ============================================================================
export function detectChainType(chainId: number): { type: ChainType; name: string } {
  if (chainId === 501) {
    return { type: ChainType.SOLANA, name: 'Solana' };
  } else if (chainId === 1815) {
    return { type: ChainType.CARDANO, name: 'Cardano' };
  } else {
    // All other chains are EVM
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      43114: 'Avalanche',
      250: 'Fantom',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base'
    };
    return { 
      type: ChainType.EVM, 
      name: chainNames[chainId] || `Chain ${chainId}` 
    };
  }
}
