/* eslint-disable no-console */

import { execSync } from "child_process";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface AIReviewResult {
  risk_level: RiskLevel;
  merge_allowed: boolean;
  reasons: string[];
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is not set");
  process.exit(1);
}

/**
 * Get PR diff
 */
function getGitDiff(): string {
  try {
    return execSync("git diff origin/main...HEAD", {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    console.error("❌ Failed to get git diff");
    process.exit(1);
  }
}

/**
 * Call OpenAI API
 */
async function callAI(diff: string): Promise<AIReviewResult> {
  const prompt = `
You are a strict senior security engineer.

Analyze the following Git diff and respond ONLY in valid JSON.
NO markdown. NO explanations outside JSON.

Check for:
- Security vulnerabilities
- Logic bugs
- Performance risks
- Bad practices

Rules:
- If ANY serious issue exists → risk_level = HIGH or CRITICAL
- merge_allowed must be false for HIGH or CRITICAL

Return JSON exactly in this format:
{
  "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
  "merge_allowed": true | false,
  "reasons": ["reason1", "reason2"]
}

Git Diff:
${diff}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("❌ OpenAI API error:", text);
    process.exit(1);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.error("❌ Empty AI response");
    process.exit(1);
  }

  try {
    return JSON.parse(content);
  } catch {
    console.error("❌ AI returned invalid JSON");
    console.error(content);
    process.exit(1);
  }
}

/**
 * Validate AI response
 */
function validateResult(result: AIReviewResult) {
  const validLevels: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  if (!validLevels.includes(result.risk_level)) {
    console.error("❌ Invalid risk_level from AI");
    process.exit(1);
  }

  if (typeof result.merge_allowed !== "boolean") {
    console.error("❌ merge_allowed must be boolean");
    process.exit(1);
  }

  if (!Array.isArray(result.reasons)) {
    console.error("❌ reasons must be an array");
    process.exit(1);
  }
}

/**
 * Main
 */
(async function main() {
  console.log("🤖 AI PR Review started...");

  const diff = getGitDiff();

  if (!diff.trim()) {
    console.log("ℹ️ No code changes detected");
    process.exit(0);
  }

  const result = await callAI(diff);
  validateResult(result);

  console.log("🧠 AI Review Result:");
  console.log(JSON.stringify(result, null, 2));

  if (result.risk_level === "HIGH" || result.risk_level === "CRITICAL") {
    console.error("❌ PR BLOCKED by AI review");
    process.exit(1);
  }

  console.log("✅ AI review passed. PR can be merged.");
})();
