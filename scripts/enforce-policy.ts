import * as fs from 'fs';
import { getReport, Report } from '../src/report/report-builder';
import { PolicyConfig } from '../src/policy/policy.types';
import { evaluatePolicy } from '../src/policy/policy-evaluator';

/* =============================
   Load Policy Config
============================= */

const POLICY_FILE = './policy.json';

function loadPolicy(): PolicyConfig {
  if (!fs.existsSync(POLICY_FILE)) {
    console.warn(`Policy file not found at ${POLICY_FILE}, using default policy.`);
    return {
      block_on_code_quality_fail: true,
      block_on_security_fail: true,
      block_on_ai_risk: ['HIGH', 'MEDIUM'],
    };
  }

  const data = fs.readFileSync(POLICY_FILE, 'utf-8');
  return JSON.parse(data) as PolicyConfig;
}

/* =============================
   Enforcement Logic
============================= */

const policy: PolicyConfig = loadPolicy();
const report: Report = getReport();

const result = evaluatePolicy(policy, report);

if (result.block) {
  console.error('❌ PR Blocked due to policy violations!');
  result.warnings.forEach((w) => console.warn(`⚠️ ${w}`));
  process.exit(1);
}

console.log('✅ All policy checks passed.');
