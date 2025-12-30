import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface Policy {
  min_code_quality_pass: boolean;
  allow_high_risk_ai: boolean;
  max_sast_findings: number;
}

export function loadPolicy(path: string = 'policy.yml'): Policy {
  if (!fs.existsSync(path)) {
    throw new Error(`Policy file not found: ${path}`);
  }

  const file = fs.readFileSync(path, 'utf8');
  const parsed = yaml.load(file);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid policy file format');
  }

  return parsed as Policy;
}
