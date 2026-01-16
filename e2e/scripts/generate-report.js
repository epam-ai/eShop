/**
 * Generate HTML report from Cucumber JSON results
 * Uses cucumber-html-reporter to create a nice HTML report
 */

const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// Check for different report files (smoke, critical, or default)
const reportsDir = path.join(__dirname, '../reports/json');
const possibleReports = [
  'cucumber-report.json',
  'smoke-report.json',
  'critical-report.json'
];

let jsonReportPath = null;
let reportType = 'default';

for (const reportFile of possibleReports) {
  const filePath = path.join(reportsDir, reportFile);
  if (fs.existsSync(filePath)) {
    jsonReportPath = filePath;
    reportType = reportFile.replace('-report.json', '').replace('cucumber', 'full');
    break;
  }
}

if (!jsonReportPath) {
  console.log('⚠️  No JSON report found. Skipping HTML report generation.');
  console.log(`   Checked: ${possibleReports.join(', ')}`);
  process.exit(0);
}

console.log(`📊 Generating HTML report from: ${path.basename(jsonReportPath)}`);

// Configure report options
const options = {
  theme: 'bootstrap',
  jsonFile: jsonReportPath,
  output: path.join(__dirname, `../reports/html/${reportType}-report.html`),
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'Application': 'eShop',
    'Test Suite': reportType.charAt(0).toUpperCase() + reportType.slice(1),
    'Test Environment': process.env.TEST_ENV || 'local',
    'Base URL': process.env.BASE_URL || 'http://localhost:5045',
    'Browser': 'Chromium (Playwright)',
    'Platform': process.platform,
    'Headless': process.env.HEADLESS || 'true',
    'Executed': new Date().toISOString()
  },
  failedSummaryReport: true,
  brandTitle: `eShop E2E Test Report - ${reportType}`,
  name: 'Cucumber BDD Tests',
  columnLayout: 1
};

try {
  reporter.generate(options);
  console.log('✅ HTML report generated successfully!');
  console.log(`📄 Report location: ${options.output}`);
  console.log('💡 View report: npm run test:e2e:report');
} catch (error) {
  console.error('❌ Error generating HTML report:', error.message);
  process.exit(1);
}
