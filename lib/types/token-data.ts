export interface TokenData {
  // === MOBULA DATA (Always Available) ===
  marketCap: number;
  fdv: number;
  liquidityUSD: number;
  totalSupply: number;
  circulatingSupply: number;
  maxSupply: number | null;
  holderCount: number;
  top10HoldersPct: number; // 0-1 decimal (0.65 = 65%)
  volume24h: number;
  ageDays: number;
  burnedSupply: number;
  txCount24h: number;

  // Vesting data (from Mobula or DropsTab)
  nextUnlock30dPct?: number; // 0-1 decimal
  teamVestingMonths?: number;
  teamAllocationPct?: number;

  // === GOPLUS DATA (Optional - fallback when unavailable) ===
  is_honeypot?: boolean;
  is_mintable?: boolean;
  owner_renounced?: boolean;
  buy_tax?: number; // 0-1 decimal (0.12 = 12%)
  sell_tax?: number; // 0-1 decimal
  tax_modifiable?: boolean;
  is_open_source?: boolean;
  lp_locked?: boolean;
  creator_balance?: number;
}

export interface RiskResult {
  overall_risk_score: number; // 0-100
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence_score: number; // 70-96 based on data availability
  breakdown: Partial<RiskBreakdown>;
  data_sources: string[];
  goplus_status?: "active" | "fallback";

  // Premium only fields
  critical_flags?: string[];
  upcoming_risks?: {
    next_30_days: number;
    forecast: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  };
  detailed_insights?: string[];
  upgrade_message?: string; // Free users only
  plan?: "FREE" | "PREMIUM";
  
  // AI & Social Metrics (Premium only)
  ai_insights?: {
    classification: 'MEME_TOKEN' | 'UTILITY_TOKEN';
    confidence: number;
    reasoning: string;
    meme_baseline_applied: boolean;
    is_manual_override?: boolean;
  };
  twitter_metrics?: {
    followers: number;
    engagement_rate: number;
    tweets_7d: number;
    adoption_score: number;
    handle: string;
  };
}

export interface RiskBreakdown {
  supplyDilution: number;
  holderConcentration: number;
  liquidityDepth: number;
  vestingUnlock: number;
  contractControl: number;
  taxFee: number;
  distribution: number;
  burnDeflation: number;
  adoption: number;
  auditTransparency: number;
}


