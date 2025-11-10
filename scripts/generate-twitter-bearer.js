#!/usr/bin/env node

/**
 * Generate Twitter Bearer Token from API Key + Secret
 * Run with: node scripts/generate-twitter-bearer.js
 */

require('dotenv').config({ path: '.env.local' });

async function generateBearerToken() {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ Missing TWITTER_API_KEY or TWITTER_API_SECRET in .env.local');
    process.exit(1);
  }
  
  console.log('🔑 Generating Twitter Bearer Token...\n');
  
  try {
    // Encode credentials
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Request bearer token
    const response = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to generate token:', error);
      process.exit(1);
    }
    
    const data = await response.json();
    
    console.log('✅ Bearer Token Generated!\n');
    console.log('━'.repeat(80));
    console.log(data.access_token);
    console.log('━'.repeat(80));
    console.log('\n📝 Add this to your .env.local:\n');
    console.log(`TWITTER_BEARER_TOKEN=${data.access_token}`);
    console.log('\n✅ Token type:', data.token_type);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateBearerToken();
