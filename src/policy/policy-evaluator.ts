import { Report } from '../report/report-builder';
import { PolicyConfig } from './policy.types';

export interface PolicyResult {
  block: boolean;
  warnings: string[];
}

export function evaluatePolicy(policy: PolicyConfig, report: Report): PolicyResult {
  const warnings: string[] = [];
  let block = false;

  // ---- Code Quality ----
  (Object.keys(report.code_quality) as (keyof typeof report.code_quality)[]).forEach((key) => {
    if (report.code_quality[key] === 'fail' && policy.block_on_code_quality_fail) {
      block = true;
    }
  });

  // ---- Security ----
  if (policy.block_on_security_fail) {
    if (report.security.dependencies === 'fail') block = true;
    if (report.security.secrets === 'fail') block = true;
    if (report.security.sast.findings > 0) block = true;
  }

  // ---- AI Review ----
  if (policy.block_on_ai_risk.includes(report.ai_review.risk_level)) {
    block = true;
  }

  return { block, warnings };
}
