import { AIRiskLevel } from '../report/report-builder';

export interface PolicyConfig {
  block_on_code_quality_fail: boolean;
  block_on_security_fail: boolean;
  block_on_ai_risk: AIRiskLevel[];
}
