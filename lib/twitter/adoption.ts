/**
 * Twitter/X Integration for Adoption Metrics
 * Uses Twitter API v2 for real social sentiment data
 */

export interface TwitterMetrics {
  followerCount: number;
  tweetVolume24h: number;
  engagement: number;
  verified: boolean;
  accountAge: number;
}

/**
 * Fetch Twitter adoption data for a token project
 * @param tokenSymbol - Token symbol (e.g., "BTC", "ETH", "MAGA")
 * @param projectTwitterHandle - Optional project handle (e.g., "@bitcoin")
 */
export async function getTwitterAdoptionData(
  tokenSymbol: string,
  projectTwitterHandle?: string
): Promise<TwitterMetrics> {
  
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.log('[Twitter] No bearer token configured');
    return {
      followerCount: 0,
      tweetVolume24h: 0,
      engagement: 0,
      verified: false,
      accountAge: 0
    };
  }
  
  let followerCount = 0;
  let verified = false;
  let accountAge = 0;
  
  // 1. Get project account metrics (if handle provided)
  if (projectTwitterHandle) {
    try {
      const cleanHandle = projectTwitterHandle.replace('@', '').trim();
      
      console.log(`[Twitter] Fetching user @${cleanHandle}`);
      
      const userResponse = await fetch(
        `https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=public_metrics,created_at,verified`,
        {
          headers: { 
            'Authorization': `Bearer ${bearerToken}`,
            'User-Agent': 'Tokenomics Lab v1.0'
          }
        }
      );
      
      if (!userResponse.ok) {
        console.warn(`[Twitter] User fetch failed: ${userResponse.status}`);
      } else {
        const userData = await userResponse.json();
        
        if (userData.data) {
          followerCount = userData.data.public_metrics?.followers_count || 0;
          verified = userData.data.verified || false;
          
          const createdAt = new Date(userData.data.created_at).getTime();
          accountAge = Math.floor((Date.now() - createdAt) / 86400000);
          
          console.log(`[Twitter] User data: ${followerCount} followers, ${accountAge} days old`);
        }
      }
    } catch (error: any) {
      console.error('[Twitter] User fetch error:', error.message);
    }
  }
  
  // 2. Search for recent tweets about token (last 24h)
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  
  let tweetVolume24h = 0;
  let totalEngagement = 0;
  
  try {
    // Use hashtag only (cashtag search requires Premium+ API)
    const query = `#${tokenSymbol} -is:retweet`;
    
    console.log(`[Twitter] Searching tweets: "${query}"`);
    
    const searchResponse = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?` +
      `query=${encodeURIComponent(query)}` +
      `&start_time=${yesterday}` +
      `&max_results=100` +
      `&tweet.fields=public_metrics`,
      {
        headers: { 
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'Tokenomics Lab v1.0'
        }
      }
    );
    
    if (!searchResponse.ok) {
      console.warn(`[Twitter] Search failed: ${searchResponse.status}`);
    } else {
      const searchData = await searchResponse.json();
      
      tweetVolume24h = searchData.meta?.result_count || 0;
      
      if (searchData.data && Array.isArray(searchData.data)) {
        totalEngagement = searchData.data.reduce((sum: number, tweet: any) => {
          const m = tweet.public_metrics || {};
          return sum + (m.like_count || 0) + (m.retweet_count || 0) + (m.reply_count || 0);
        }, 0);
      }
      
      console.log(`[Twitter] Found ${tweetVolume24h} tweets, ${totalEngagement} total engagement`);
    }
  } catch (error: any) {
    console.error('[Twitter] Search error:', error.message);
  }
  
  const engagement = tweetVolume24h > 0 ? totalEngagement / tweetVolume24h : 0;
  
  return {
    followerCount,
    tweetVolume24h,
    engagement,
    verified,
    accountAge
  };
}

/**
 * Calculate adoption risk score (0-100, higher = riskier)
 * Combines Twitter metrics with on-chain holder data
 */
export function calculateAdoptionRisk(
  twitterData: TwitterMetrics,
  holderCount: number
): number {
  
  let score = 0;
  
  // Factor 1: Follower count (40% weight)
  if (twitterData.followerCount === 0) {
    score += 40; // No social presence
  } else if (twitterData.followerCount < 500) {
    score += 35; // Very small following
  } else if (twitterData.followerCount < 5000) {
    score += 25; // Small community
  } else if (twitterData.followerCount < 50000) {
    score += 15; // Growing community
  } else if (twitterData.followerCount < 500000) {
    score += 5; // Strong community
  }
  // else 0 - Massive following
  
  // Factor 2: Tweet volume (30% weight)
  if (twitterData.tweetVolume24h === 0) {
    score += 30; // Zero discussion
  } else if (twitterData.tweetVolume24h < 10) {
    score += 25; // Very low activity
  } else if (twitterData.tweetVolume24h < 50) {
    score += 15; // Low activity
  } else if (twitterData.tweetVolume24h < 200) {
    score += 5; // Moderate activity
  }
  // else 0 - High activity
  
  // Factor 3: Engagement quality (20% weight)
  if (twitterData.engagement < 1) {
    score += 20; // Very poor engagement
  } else if (twitterData.engagement < 5) {
    score += 10; // Low engagement
  } else if (twitterData.engagement < 20) {
    score += 5; // Moderate engagement
  }
  // else 0 - Strong engagement
  
  // Factor 4: Verification & account age (10% weight)
  if (!twitterData.verified && twitterData.accountAge < 90) {
    score += 10; // New unverified account
  } else if (!twitterData.verified && twitterData.accountAge < 365) {
    score += 5; // Young unverified account
  }
  // else 0 - Verified or old account
  
  // Bonus penalty: Low holders despite high Twitter presence
  if (twitterData.followerCount > 10000 && holderCount < 100) {
    score += 15; // Suspicious mismatch
  }
  
  // Bonus reward: High holders with low Twitter (organic growth)
  if (holderCount > 5000 && twitterData.followerCount < 1000) {
    score = Math.max(0, score - 10);
  }
  
  return Math.min(score, 100);
}

/**
 * Get adoption risk interpretation
 */
export function getAdoptionRiskLevel(score: number): {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
} {
  
  if (score < 20) {
    return {
      level: 'LOW',
      message: '✅ Strong social presence with engaged community'
    };
  }
  
  if (score < 40) {
    return {
      level: 'MEDIUM',
      message: '⚠️ Moderate social presence, growing community'
    };
  }
  
  if (score < 70) {
    return {
      level: 'HIGH',
      message: '🚨 Weak social presence, limited community'
    };
  }
  
  return {
    level: 'CRITICAL',
    message: '🔴 No social presence - high abandonment risk'
  };
}

/**
 * Extract Twitter handle from various formats
 */
export function extractTwitterHandle(input: string | undefined): string | undefined {
  if (!input) return undefined;
  
  // Already a handle
  if (input.startsWith('@')) {
    return input;
  }
  
  // Full Twitter URL
  if (input.includes('twitter.com/') || input.includes('x.com/')) {
    const match = input.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
    return match ? `@${match[1]}` : undefined;
  }
  
  // Just username
  if (/^[a-zA-Z0-9_]+$/.test(input)) {
    return `@${input}`;
  }
  
  return undefined;
}
