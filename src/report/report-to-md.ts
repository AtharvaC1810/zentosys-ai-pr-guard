import * as fs from 'fs';
import { Report } from './report-builder';

export function writeMarkdownReport(report: Report) {
  const content = `
# PR Guard Report

## Summary
Final status: **${report.final_status}**

### Code Quality
- ESLint: ${report.code_quality.lint}
- Format: ${report.code_quality.format}
- Typecheck: ${report.code_quality.typecheck}

### Security
- Dependencies: ${report.security.dependencies}
- Secrets: ${report.security.secrets}
- SAST findings: ${report.security.sast.findings}

### AI Review
- Summary: ${report.ai_review.summary}
- Risk level: ${report.ai_review.risk_level}
`;

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/pr-guard-report.md', content.trim());
}
