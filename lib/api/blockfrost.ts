/**
 * Blockfrost API Service (Cardano)
 * Provides Cardano-specific security data (minting policies, time-locks)
 */

const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;
const BLOCKFROST_BASE_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

export interface CardanoSecurityData {
  policyLocked: boolean;
  policyExpired: boolean;
  policyScript: string;
}

/**
 * Get Cardano minting policy data for security analysis
 */
export async function getBlockfrostCardanoData(
  assetId: string
): Promise<CardanoSecurityData | null> {
  try {
    if (!BLOCKFROST_PROJECT_ID) {
      console.warn('[Blockfrost] Project ID not configured');
      return null;
    }

    console.log(`[Blockfrost] Fetching Cardano data for ${assetId}`);

    const response = await fetch(
      `${BLOCKFROST_BASE_URL}/assets/${assetId}`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID
        }
      }
    );

    if (!response.ok) {
      console.warn(`[Blockfrost] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Determine if policy is locked or expired
    // mint_or_burn_count indicates minting activity
    // If count is 0, policy is expired (no more minting possible)
    // If count is 1, policy is time-locked (one-time mint)
    // If count > 1, policy allows multiple mints (not locked)

    const securityData: CardanoSecurityData = {
      policyLocked: data.mint_or_burn_count === 1,
      policyExpired: data.mint_or_burn_count === 0,
      policyScript: data.policy_id || ''
    };

    console.log(`[Blockfrost] Security data retrieved:`, {
      policyLocked: securityData.policyLocked,
      policyExpired: securityData.policyExpired,
      policyId: securityData.policyScript
    });

    return securityData;
  } catch (error: any) {
    console.error('[Blockfrost] Error fetching Cardano data:', error.message);
    return null;
  }
}

/**
 * Get Cardano asset metadata
 */
export async function getBlockfrostAssetMetadata(
  assetId: string
): Promise<{ name: string; symbol: string; decimals: number } | null> {
  try {
    if (!BLOCKFROST_PROJECT_ID) {
      return null;
    }

    const response = await fetch(
      `${BLOCKFROST_BASE_URL}/assets/${assetId}`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      name: data.asset_name || '',
      symbol: data.onchain_metadata?.ticker || '',
      decimals: data.onchain_metadata?.decimals || 0
    };
  } catch (error: any) {
    console.error('[Blockfrost] Error fetching metadata:', error.message);
    return null;
  }
}

/**
 * Get Cardano asset supply info
 */
export async function getBlockfrostSupplyInfo(
  assetId: string
): Promise<{ totalSupply: number; circulatingSupply: number } | null> {
  try {
    if (!BLOCKFROST_PROJECT_ID) {
      return null;
    }

    const response = await fetch(
      `${BLOCKFROST_BASE_URL}/assets/${assetId}`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Cardano native tokens have their supply directly reported
    const supply = parseInt(data.quantity || '0');

    return {
      totalSupply: supply,
      circulatingSupply: supply // Cardano tokens are typically fully circulating
    };
  } catch (error: any) {
    console.error('[Blockfrost] Error fetching supply info:', error.message);
    return null;
  }
}
