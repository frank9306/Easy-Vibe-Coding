export const ECC = {
  owner: "affaan-m",
  repo: "ECC",
  version: "v2.0.0",
  license: "MIT",
  url: "https://github.com/affaan-m/ECC"
};

export const components = [
  { id: "coding-style", type: "rule", path: "rules/common/coding-style.md", levels: ["lite", "standard", "pro", "team"] },
  { id: "development-workflow", type: "rule", path: "rules/common/development-workflow.md", levels: ["lite", "standard", "pro", "team"] },
  { id: "git-workflow", type: "rule", path: "rules/common/git-workflow.md", levels: ["lite", "standard", "pro", "team"] },
  { id: "testing", type: "rule", path: "rules/common/testing.md", levels: ["standard", "pro", "team"] },
  { id: "security", type: "rule", path: "rules/common/security.md", levels: ["standard", "pro", "team"] },
  { id: "code-review", type: "rule", path: "rules/common/code-review.md", levels: ["standard", "pro", "team"] },
  { id: "performance", type: "rule", path: "rules/common/performance.md", levels: ["pro", "team"] },
  { id: "patterns", type: "rule", path: "rules/common/patterns.md", levels: ["pro", "team"] },
  { id: "context-budget", type: "skill", path: "skills/context-budget", levels: ["standard", "pro", "team"] },
  { id: "agent-introspection-debugging", type: "skill", path: "skills/agent-introspection-debugging", levels: ["standard", "pro", "team"] },
  { id: "verification-loop", type: "skill", path: "skills/verification-loop", levels: ["standard", "pro", "team"] },
  { id: "architecture-decision-records", type: "skill", path: "skills/architecture-decision-records", levels: ["pro", "team"] },
  { id: "agent-architecture-audit", type: "skill", path: "skills/agent-architecture-audit", levels: ["pro", "team"] },
  { id: "codebase-onboarding", type: "skill", path: "skills/codebase-onboarding", levels: ["pro", "team"] },
  { id: "security-scan", type: "skill", path: "skills/security-scan", levels: ["team"] },
  { id: "eval-harness", type: "skill", path: "skills/eval-harness", levels: ["team"] }
];

export const levels = {
  lite: "Essential guardrails for people starting with Vibe Coding",
  standard: "Testing, security and verification for independent builders",
  pro: "Architecture, context and maintainability for experienced developers",
  team: "Governance and audit workflows for teams and multi-agent projects",
  custom: "Choose individual components"
};

export function selectComponents(level, ids = []) {
  if (level === "custom") {
    const wanted = new Set(ids);
    return components.filter((item) => wanted.has(item.id));
  }
  if (!levels[level]) throw new Error(`Unknown level: ${level}`);
  return components.filter((item) => item.levels.includes(level));
}
