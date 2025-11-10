#!/usr/bin/env node

/**
 * Tokenomics API Data Fetch Test Script
 * Tests what data each API can fetch and how much
 */

const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Debug: Check what API keys are loaded
console.log('🔑 API Keys Status:');
console.log(`   Mobula: ${process.env.MOBULA_API_KEY ? '✅' : '❌'}`);
console.log(`   Helius: ${process.env.HELIUS_API_KEY ? '✅' : '❌'}`);
console.log(`   Blockfrost: ${process.env.BLOCKFROST_PROJECT_ID ? '✅' : '❌'}`);
console.log(`   CoinGecko: ${process.env.COINGECKO_API_KEY ? '✅' : '❌'}`);
console.log();

// Test tokens for different chains
const TEST_TOKENS = {
  ethereum: '0xa0b86a33e6c49843b4987c6e3f9c4b8e7c6b6c6b', // USDC on Ethereum
  bsc: '0x55d398326f99059ff775485246999027b3197955', // USDT on BSC
  solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
  cardano: '1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209', // ADA
  polygon: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC on Polygon
};

// API configurations
const APIS = {
  mobula: {
    name: 'Mobula API',
    baseUrl: 'https://api.mobula.io/api/1',
    apiKey: process.env.MOBULA_API_KEY,
    endpoints: {
      marketData: '/market/data',
      multiData: '/market/multi-data',
      marketHistory: '/market/history',
      marketPairs: '/market/pairs',
    }
  },
  goplus: {
    name: 'GoPlus Security API',
    baseUrl: 'https://api.gopluslabs.io/api/v1',
    apiKey: null, // Public API
    endpoints: {
      tokenSecurity: '/token_security',
      tokenApproval: '/token_approval_security',
      addressSecurity: '/address_security',
      nftSecurity: '/nft_security',
    }
  },
  helius: {
    name: 'Helius API (Solana)',
    baseUrl: 'https://api.helius.xyz/v0',
    apiKey: process.env.HELIUS_API_KEY,
    endpoints: {
      tokenMetadata: '/token-metadata',
      balances: '/balances',
      transactions: '/transactions',
      parsedTransactions: '/parsed-transactions',
    }
  },
  blockfrost: {
    name: 'Blockfrost API (Cardano)',
    baseUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
    apiKey: process.env.BLOCKFROST_PROJECT_ID,
    endpoints: {
      assets: '/assets',
      addresses: '/addresses',
      accounts: '/accounts',
      pools: '/pools',
    }
  },
  coingecko: {
    name: 'CoinGecko API',
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY,
    endpoints: {
      coins: '/coins',
      simple: '/simple',
      search: '/search',
    }
  }
};

// Utility functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    const req = protocol.get(url, options, (res) => {
      let data = '';
      let dataSize = 0;

      res.on('data', (chunk) => {
        data += chunk;
        dataSize += chunk.length;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            size: dataSize,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            size: dataSize,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    // Timeout after 10 seconds
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI(apiName, apiConfig) {
  console.log(`\n🔍 Testing ${apiConfig.name}`);
  console.log('='.repeat(50));

  if (!apiConfig.apiKey && apiName !== 'goplus') {
    console.log(`❌ No API key configured for ${apiName}`);
    return;
  }

  const results = {
    api: apiName,
    endpoints: {},
    totalRequests: 0,
    successfulRequests: 0,
    totalDataSize: 0,
    averageResponseTime: 0
  };

  for (const [endpointName, endpointPath] of Object.entries(apiConfig.endpoints)) {
    console.log(`\n📡 Testing ${endpointName}...`);

    try {
      let url = `${apiConfig.baseUrl}${endpointPath}`;
      const headers = {};

      // Add API key to headers if needed
      if (apiConfig.apiKey) {
        if (apiName === 'helius') {
          url += `?api-key=${apiConfig.apiKey}`;
        } else if (apiName === 'blockfrost') {
          headers['project_id'] = apiConfig.apiKey;
        } else if (apiName === 'mobula') {
          headers['Authorization'] = apiConfig.apiKey;
        } else if (apiName === 'coingecko' && apiConfig.apiKey) {
          headers['x-cg-demo-api-key'] = apiConfig.apiKey;
        }
      }

      // Customize request based on endpoint
      let testParams = '';
      switch (endpointName) {
        case 'marketData':
          testParams = `?asset=${TEST_TOKENS.ethereum}`;
          break;
        case 'multiData':
          testParams = `?assets=${TEST_TOKENS.ethereum},${TEST_TOKENS.bsc}`;
          break;
        case 'marketHistory':
          testParams = `?asset=${TEST_TOKENS.ethereum}&from=1693526400&to=1693612800`;
          break;
        case 'marketPairs':
          testParams = `?asset=${TEST_TOKENS.ethereum}`;
          break;
        case 'tokenSecurity':
          testParams = `/1?contract_addresses=${TEST_TOKENS.ethereum}`;
          break;
        case 'tokenApproval':
          testParams = `/1?contract_addresses=${TEST_TOKENS.ethereum}`;
          break;
        case 'addressSecurity':
          testParams = `/${TEST_TOKENS.ethereum}`;
          break;
        case 'tokenMetadata':
          // POST request for Helius
          break;
        case 'balances':
          testParams = `/${TEST_TOKENS.ethereum}`;
          break;
        case 'transactions':
          testParams = `?address=${TEST_TOKENS.ethereum}&limit=10`;
          break;
        case 'parsedTransactions':
          testParams = `?address=${TEST_TOKENS.ethereum}&limit=5`;
          break;
        case 'assets':
          testParams = `/${TEST_TOKENS.cardano}`;
          break;
        case 'addresses':
          testParams = `/${TEST_TOKENS.cardano}`;
          break;
        case 'coins':
          testParams = `/bitcoin`;
          break;
        case 'simple':
          testParams = `/price?ids=bitcoin,ethereum&vs_currencies=usd`;
          break;
        case 'search':
          testParams = `?query=bitcoin`;
          break;
      }

      url += testParams;

      const startTime = Date.now();

      let response;
      if (endpointName === 'tokenMetadata' && apiName === 'helius') {
        // Special POST request for Helius token metadata
        response = await makeRequest(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            mintAccounts: [TEST_TOKENS.solana]
          })
        });
      } else {
        response = await makeRequest(url, { headers });
      }

      const duration = Date.now() - startTime;

      results.totalRequests++;
      results.totalDataSize += response.size;
      results.averageResponseTime += duration;

      if (response.status === 200) {
        results.successfulRequests++;

        console.log(`✅ ${endpointName}: ${response.status} (${formatDuration(duration)})`);
        console.log(`📊 Data size: ${formatBytes(response.size)}`);

        // Analyze response structure
        if (typeof response.data === 'object') {
          const fieldCount = countFields(response.data);
          console.log(`📋 Fields: ${fieldCount}`);

          // Show sample fields
          const sampleFields = getSampleFields(response.data, 3);
          if (sampleFields.length > 0) {
            console.log(`🔍 Sample data: ${sampleFields.join(', ')}`);
          }
        } else {
          console.log(`📄 Response type: ${typeof response.data}`);
        }

        results.endpoints[endpointName] = {
          status: 'success',
          responseTime: duration,
          dataSize: response.size,
          fieldCount: typeof response.data === 'object' ? countFields(response.data) : 0
        };

      } else {
        console.log(`❌ ${endpointName}: ${response.status} (${formatDuration(duration)})`);
        results.endpoints[endpointName] = {
          status: 'error',
          responseTime: duration,
          error: response.status
        };
      }

    } catch (error) {
      console.log(`❌ ${endpointName}: Error - ${error.message}`);
      results.endpoints[endpointName] = {
        status: 'error',
        error: error.message
      };
    }
  }

  // Calculate averages
  if (results.totalRequests > 0) {
    results.averageResponseTime = results.averageResponseTime / results.totalRequests;
  }

  console.log(`\n📈 ${apiConfig.name} Summary:`);
  console.log(`   Success Rate: ${results.successfulRequests}/${results.totalRequests}`);
  console.log(`   Total Data: ${formatBytes(results.totalDataSize)}`);
  console.log(`   Avg Response: ${formatDuration(results.averageResponseTime)}`);

  return results;
}

function countFields(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth || typeof obj !== 'object' || obj === null) {
    return 0;
  }

  let count = 0;
  for (const key in obj) {
    count++;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countFields(obj[key], maxDepth, currentDepth + 1);
    }
  }
  return count;
}

function getSampleFields(obj, maxFields = 3, prefix = '') {
  const fields = [];

  for (const key in obj) {
    if (fields.length >= maxFields) break;

    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      fields.push(...getSampleFields(value, maxFields - fields.length, fullKey));
    } else {
      fields.push(`${fullKey}: ${typeof value}`);
    }
  }

  return fields;
}

async function main() {
  console.log('🚀 Tokenomics API Data Fetch Test');
  console.log('==================================\n');

  console.log('📋 Test Configuration:');
  console.log(`   Ethereum Token: ${TEST_TOKENS.ethereum}`);
  console.log(`   BSC Token: ${TEST_TOKENS.bsc}`);
  console.log(`   Solana Token: ${TEST_TOKENS.solana}`);
  console.log(`   Cardano Token: ${TEST_TOKENS.cardano}`);
  console.log(`   Polygon Token: ${TEST_TOKENS.polygon}\n`);

  const allResults = [];

  // Test each API
  for (const [apiName, apiConfig] of Object.entries(APIS)) {
    const result = await testAPI(apiName, apiConfig);
    if (result) {
      allResults.push(result);
    }

    // Small delay between APIs to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Final summary
  console.log('\n🎯 FINAL SUMMARY');
  console.log('================');

  const summary = allResults.map(result => ({
    api: result.api,
    successRate: `${result.successfulRequests}/${result.totalRequests}`,
    totalData: formatBytes(result.totalDataSize),
    avgResponse: formatDuration(result.averageResponseTime)
  }));

  console.table(summary);

  console.log('\n✅ Test completed!');
}

// Run the test
main().catch(console.error);