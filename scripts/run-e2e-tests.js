#!/usr/bin/env node

/**
 * E2E Test Runner for Tokenomics Lab
 * 
 * This script runs comprehensive end-to-end tests using Playwright
 * and generates detailed reports.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CI_MODE = process.env.CI === 'true';
const HEADLESS = process.env.HEADLESS !== 'false';

console.log('🧪 Tokenomics Lab E2E Test Runner');
console.log('=' .repeat(50));
console.log(`Base URL: ${BASE_URL}`);
console.log(`CI Mode: ${CI_MODE}`);
console.log(`Headless: ${HEADLESS}`);
console.log('=' .repeat(50));

// Ensure test results directory exists
const testResultsDir = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Test suites to run
const testSuites = [
  {
    name: 'Full Website E2E Tests',
    file: 'tests/e2e-full-website.spec.js',
    description: 'Tests all pages and core functionality'
  }
];

async function runTests() {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  console.log('\n🚀 Starting E2E Test Execution...\n');
  
  for (const suite of testSuites) {
    console.log(`\n📋 Running: ${suite.name}`);
    console.log(`📄 Description: ${suite.description}`);
    console.log(`📁 File: ${suite.file}\n`);
    
    try {
      // Build Playwright command
      let command = 'npx playwright test';
      
      // Add specific test file
      command += ` ${suite.file}`;
      
      // Add options
      if (HEADLESS) {
        command += ' --headed=false';
      } else {
        command += ' --headed=true';
      }
      
      if (CI_MODE) {
        command += ' --workers=1 --retries=2';
      }
      
      // Add reporter options
      command += ' --reporter=list,html,json';
      
      console.log(`🔧 Command: ${command}\n`);
      
      // Execute tests
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'inherit',
        env: {
          ...process.env,
          BASE_URL: BASE_URL
        }
      });
      
      console.log(`✅ ${suite.name} completed successfully\n`);
      passedTests++;
      
    } catch (error) {
      console.error(`❌ ${suite.name} failed:`);
      console.error(error.message);
      console.error('');
      failedTests++;
    }
    
    totalTests++;
  }
  
  // Generate summary report
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Test Suites: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Check for test results
  const htmlReportPath = path.join(testResultsDir, 'html-report', 'index.html');
  const jsonReportPath = path.join(testResultsDir, 'results.json');
  
  if (fs.existsSync(htmlReportPath)) {
    console.log(`\n📄 HTML Report: ${htmlReportPath}`);
    console.log('   Open this file in a browser to view detailed results');
  }
  
  if (fs.existsSync(jsonReportPath)) {
    console.log(`📄 JSON Report: ${jsonReportPath}`);
    
    try {
      const results = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
      const stats = results.stats || {};
      
      console.log('\n📈 Detailed Test Statistics:');
      console.log(`   Total Tests: ${stats.total || 'N/A'}`);
      console.log(`   Passed: ${stats.passed || 'N/A'}`);
      console.log(`   Failed: ${stats.failed || 'N/A'}`);
      console.log(`   Skipped: ${stats.skipped || 'N/A'}`);
      console.log(`   Duration: ${stats.duration ? (stats.duration / 1000).toFixed(2) + 's' : 'N/A'}`);
      
    } catch (parseError) {
      console.log('   (Could not parse detailed statistics)');
    }
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (failedTests === 0) {
    console.log('   ✅ All tests passed! Your website is functioning correctly.');
    console.log('   🔄 Consider running these tests regularly in CI/CD pipeline.');
  } else {
    console.log('   ⚠️  Some tests failed. Check the detailed reports above.');
    console.log('   🔍 Review failed test screenshots and traces for debugging.');
    console.log('   🛠️  Fix issues and re-run tests before deployment.');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Review HTML report for detailed test results');
  console.log('   2. Check screenshots/videos for failed tests');
  console.log('   3. Fix any identified issues');
  console.log('   4. Add these tests to your CI/CD pipeline');
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled Error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test execution interrupted by user');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Test Runner Error:', error);
  process.exit(1);
});