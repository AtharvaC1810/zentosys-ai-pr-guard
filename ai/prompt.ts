export function buildPrompt(diff: string): string {
  return `
You are a senior security engineer.

Analyze the following GitHub Pull Request diff ONLY.

Check for:
- Security vulnerabilities
- Authentication / authorization flaws
- Logic bugs
- Performance issues
- Bad engineering practices

RULES:
- Respond ONLY with valid JSON
- NO markdown
- NO explanations outside JSON
- NO extra text

JSON FORMAT:
{
  "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
  "merge_allowed": true | false,
  "reasons": ["short reason 1", "short reason 2"]
}

PR DIFF:
${diff}
`;
}
