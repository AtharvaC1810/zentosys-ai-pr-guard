export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIReviewResult {
  risk_level: AIRiskLevel;
  merge_allowed: boolean;
  reasons: string[];
}
