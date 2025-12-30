import * as fs from 'fs';

export type Status = 'pass' | 'fail';
export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface CodeQualityReport {
  lint: Status;
  format: Status;
  typecheck: Status;
}

export interface SecurityReport {
  dependencies: Status;
  secrets: Status;
  sast: { findings: number };
}

export interface AIReviewReport {
  summary: string;
  risk_level: AIRiskLevel;
}

export interface Report {
  code_quality: CodeQualityReport;
  security: SecurityReport;
  ai_review: AIReviewReport;
  final_status: 'PASS' | 'FAIL';
}

const report: Report = {
  code_quality: { lint: 'pass', format: 'pass', typecheck: 'pass' },
  security: { dependencies: 'pass', secrets: 'pass', sast: { findings: 0 } },
  ai_review: { summary: 'Skipped', risk_level: 'UNKNOWN' },
  final_status: 'PASS',
};

export function setLintStatus(value: Status) {
  report.code_quality.lint = value;
}

export function setFormatStatus(value: Status) {
  report.code_quality.format = value;
}

export function setTypecheckStatus(value: Status) {
  report.code_quality.typecheck = value;
}

export function setDependencyStatus(value: Status) {
  report.security.dependencies = value;
}

export function setSecretsStatus(value: Status) {
  report.security.secrets = value;
}

export function setSastFindings(count: number) {
  report.security.sast.findings = count;
}

export function setAIReview(summary: string, riskLevel: AIRiskLevel) {
  report.ai_review = { summary, risk_level: riskLevel };
}

export function finalizeReport(): void {
  const failed =
    report.code_quality.lint === 'fail' ||
    report.code_quality.format === 'fail' ||
    report.code_quality.typecheck === 'fail' ||
    report.security.dependencies === 'fail' ||
    report.security.secrets === 'fail' ||
    report.security.sast.findings > 0 ||
    report.ai_review.risk_level === 'HIGH';

  report.final_status = failed ? 'FAIL' : 'PASS';

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/pr-guard-report.json', JSON.stringify(report, null, 2));
}

export function getReport() {
  return report;
}
