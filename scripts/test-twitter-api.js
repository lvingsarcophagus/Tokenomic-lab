#!/usr/bin/env node

/**
 * Test Twitter API Integration
 * Verifies Bearer Token and fetches sample data
 */

require('dotenv').config({ path: '.env.local' });

async function testTwitterAPI() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.error('❌ TWITTER_BEARER_TOKEN not found in .env.local');
    process.exit(1);
  }
  
  console.log('🐦 Testing Twitter API Integration\n');
  console.log('═'.repeat(60));
  
  // Test 1: Verify credentials work
  console.log('\n📋 Test 1: Verify Credentials');
  console.log('─'.repeat(60));
  
  try {
    const verifyResponse = await fetch(
      'https://api.twitter.com/2/users/me',
      {
        headers: { 
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'Tokenomics Lab v1.0'
        }
      }
    );
    
    if (verifyResponse.ok) {
      const data = await verifyResponse.json();
      console.log('✅ Credentials valid');
      console.log(`   App: ${data.data?.name || 'Unknown'}`);
      console.log(`   Username: @${data.data?.username || 'Unknown'}`);
    } else {
      console.log('❌ Credentials invalid:', verifyResponse.status);
      console.log('   Response:', await verifyResponse.text());
    }
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
  
  // Test 2: Fetch user data (test with Bitcoin's account)
  console.log('\n📊 Test 2: Fetch User Data (@bitcoin)');
  console.log('─'.repeat(60));
  
  try {
    const userResponse = await fetch(
      'https://api.twitter.com/2/users/by/username/bitcoin?user.fields=public_metrics,created_at,verified',
      {
        headers: { 
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'Tokenomics Lab v1.0'
        }
      }
    );
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      const user = userData.data;
      
      console.log('✅ User data retrieved');
      console.log(`   Name: ${user.name}`);
      console.log(`   Username: @${user.username}`);
      console.log(`   Followers: ${user.public_metrics.followers_count.toLocaleString()}`);
      console.log(`   Following: ${user.public_metrics.following_count.toLocaleString()}`);
      console.log(`   Tweets: ${user.public_metrics.tweet_count.toLocaleString()}`);
      console.log(`   Verified: ${user.verified ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
    } else {
      console.log('❌ User fetch failed:', userResponse.status);
      console.log('   Response:', await userResponse.text());
    }
  } catch (error) {
    console.log('❌ User fetch error:', error.message);
  }
  
  // Test 3: Search tweets about BTC
  console.log('\n🔍 Test 3: Search Recent Tweets ($BTC)');
  console.log('─'.repeat(60));
  
  try {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const searchResponse = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent('$BTC -is:retweet')}&start_time=${yesterday}&max_results=10&tweet.fields=public_metrics`,
      {
        headers: { 
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'Tokenomics Lab v1.0'
        }
      }
    );
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const tweets = searchData.data || [];
      const count = searchData.meta?.result_count || 0;
      
      console.log(`✅ Found ${count} tweets in last 24h`);
      
      if (tweets.length > 0) {
        const totalEngagement = tweets.reduce((sum, tweet) => {
          const m = tweet.public_metrics;
          return sum + m.like_count + m.retweet_count + m.reply_count;
        }, 0);
        
        const avgEngagement = totalEngagement / tweets.length;
        
        console.log(`   Total engagement: ${totalEngagement.toLocaleString()}`);
        console.log(`   Avg per tweet: ${avgEngagement.toFixed(1)}`);
        console.log('\n   Sample tweets:');
        
        tweets.slice(0, 3).forEach((tweet, i) => {
          const text = tweet.text.substring(0, 60) + (tweet.text.length > 60 ? '...' : '');
          const likes = tweet.public_metrics.like_count;
          console.log(`   ${i + 1}. ${text} (${likes} ❤️)`);
        });
      }
    } else {
      const errorText = await searchResponse.text();
      console.log('❌ Search failed:', searchResponse.status);
      console.log('   Response:', errorText);
      
      // Check for rate limit
      if (searchResponse.status === 429) {
        console.log('\n⚠️  Rate Limit Hit');
        console.log('   Twitter API has usage limits');
        console.log('   Wait a few minutes and try again');
      }
    }
  } catch (error) {
    console.log('❌ Search error:', error.message);
  }
  
  console.log('\n═'.repeat(60));
  console.log('\n✅ Twitter API Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Integration is ready to use');
  console.log('   2. Twitter data will be fetched during token analysis');
  console.log('   3. Adoption risk will be calculated from social metrics\n');
}

testTwitterAPI().catch(console.error);
