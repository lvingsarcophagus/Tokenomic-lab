/**
 * Debug script to check what data Mobula API returns for MAGA token
 */

require('dotenv').config({ path: '.env.local' });

const MAGA_CONTRACT = '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7';
const MOBULA_API_KEY = process.env.MOBULA_API_KEY;

async function debugMobulaData() {
  console.log('🔍 Debugging Mobula API Response for MAGA\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    const url = `https://api.mobula.io/api/1/market/data?asset=${encodeURIComponent(MAGA_CONTRACT)}`;
    
    console.log('📡 Fetching from Mobula API...');
    console.log(`URL: ${url}\n`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': MOBULA_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const json = await response.json();
    const data = json.data;
    
    console.log('✅ Raw Mobula Response:\n');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');
    
    // Extract key fields
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 KEY DATA FIELDS:\n');
    
    console.log('Market Data:');
    console.log(`  market_cap: ${data.market_cap || 'MISSING ❌'}`);
    console.log(`  fdv: ${data.market_cap_diluted || data.fully_diluted_valuation || 'MISSING ❌'}`);
    console.log(`  liquidity: ${data.liquidity || 'MISSING ❌'}`);
    console.log(`  volume: ${data.volume || 'MISSING ❌'}`);
    console.log('');
    
    console.log('Supply Data:');
    console.log(`  total_supply: ${data.total_supply || 'MISSING ❌'}`);
    console.log(`  circulating_supply: ${data.circulating_supply || 'MISSING ❌'}`);
    console.log(`  max_supply: ${data.max_supply || 'MISSING ❌'}`);
    console.log(`  burned_supply: ${data.burned_supply || 'MISSING ❌'}`);
    console.log('');
    
    console.log('Holder Data:');
    console.log(`  holder_count: ${data.holder_count || 'MISSING ❌'}`);
    console.log(`  holders: ${data.holders || 'MISSING ❌'}`);
    console.log(`  top_holders: ${data.top_holders ? `Array[${data.top_holders.length}]` : 'MISSING ❌'}`);
    console.log('');
    
    console.log('Activity Data:');
    console.log(`  transactions_24h: ${data.transactions_24h || 'MISSING ❌'}`);
    console.log(`  tx_count_24h: ${data.tx_count_24h || 'MISSING ❌'}`);
    console.log(`  age_days: ${data.age_days || 'MISSING ❌'}`);
    console.log(`  creation_date: ${data.creation_date || 'MISSING ❌'}`);
    console.log('');
    
    // Calculate top 10 holders if available
    if (data.top_holders && Array.isArray(data.top_holders)) {
      const top10 = data.top_holders.slice(0, 10);
      const top10Pct = top10.reduce((sum, h) => sum + (h.percentage || 0), 0);
      console.log(`Top 10 Holders Concentration: ${top10Pct.toFixed(2)}%`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════');
    console.log('\n🔍 MISSING DATA ANALYSIS:\n');
    
    const missing = [];
    if (!data.liquidity && data.liquidity !== 0) missing.push('❌ liquidity (CRITICAL for liquidity_depth factor)');
    if (!data.top_holders && !data.holder_distribution) missing.push('⚠️  top_holders (needed for distribution factor)');
    if (!data.holder_count && !data.holders) missing.push('⚠️  holder_count (affects multiple factors)');
    if (!data.burned_supply && data.burned_supply !== 0) missing.push('⚠️  burned_supply (affects burn_deflation factor)');
    if (!data.transactions_24h && !data.tx_count_24h) missing.push('⚠️  transactions_24h (affects adoption factor)');
    
    if (missing.length > 0) {
      console.log('Missing fields that affect risk calculation:');
      missing.forEach(item => console.log(`  ${item}`));
    } else {
      console.log('✅ All critical fields present!');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugMobulaData();
