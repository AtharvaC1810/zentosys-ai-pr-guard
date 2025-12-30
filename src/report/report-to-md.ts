import * as fs from 'fs';
const report = JSON.parse(fs.readFileSync('pr-guard-report.json', 'utf-8'));

const md = `
## 🔍 Zentosys AI PR Guard Report

### ✅ Code Quality
- Lint: ${report.code_quality.lint}
- Formatting: ${report.code_quality.format}
- TypeCheck: ${report.code_quality.typecheck}

### 🔒 Security
- Dependencies: ${report.security.dependencies}
- Secrets: ${report.security.secrets}
- SAST Findings: ${report.security.sast.findings}

### 🤖 AI Review
**Risk Level:** ${report.ai_review.risk_level}  
${report.ai_review.summary}

### 🏁 Final Status
${report.final_status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
`;

fs.writeFileSync('pr-guard-report.md', md.trim());
