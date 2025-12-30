// scripts/generate-report.ts
import 'dotenv/config'; // MUST be first

import { finalizeReport, getReport } from '../src/report/report-builder';
import { writeMarkdownReport } from '../src/report/report-to-md';

async function main() {
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'MISSING');

  // build & finalize the report
  finalizeReport();

  // write markdown output
  writeMarkdownReport(getReport());

  console.log('📊 Report generated successfully');
}

main().catch((err) => {
  console.error('❌ Failed to generate report:', err);
  process.exit(1);
});
