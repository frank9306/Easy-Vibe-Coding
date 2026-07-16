export const ECC = {
  owner: "affaan-m",
  repo: "ECC",
  version: "v2.0.0",
  license: "MIT",
  url: "https://github.com/affaan-m/ECC"
};

const all = ["lite", "standard", "pro", "team"];
const standard = ["standard", "pro", "team"];
const pro = ["pro", "team"];

export const components = [
  { id: "coding-style", type: "rule", path: "rules/common/coding-style.md", levels: all, activation: "always", summary: "Keeps generated code focused, simple, and consistent with the project.", benefit: "Reduces speculative abstractions and unrelated edits.", useWhen: ["writing code", "refactoring", "implementing features"], keywords: ["code", "implement", "refactor", "编码", "实现", "重构"] },
  { id: "development-workflow", type: "rule", path: "rules/common/development-workflow.md", levels: all, activation: "always", summary: "Turns requests into small, verifiable engineering steps.", benefit: "Makes agent work easier to review and less likely to drift.", useWhen: ["building features", "fixing bugs", "planning code changes"], keywords: ["feature", "bug", "plan", "功能", "修复", "计划"] },
  { id: "git-workflow", type: "rule", path: "rules/common/git-workflow.md", levels: all, activation: "always", summary: "Applies safe, reviewable Git practices.", benefit: "Protects existing work and keeps changes traceable.", useWhen: ["committing", "branching", "preparing a pull request"], keywords: ["git", "commit", "branch", "pull request", "提交", "分支"] },
  { id: "testing", type: "rule", path: "rules/common/testing.md", levels: standard, activation: "automatic", summary: "Adds tests that prove behavior instead of only checking implementation.", benefit: "Prevents regressions and makes changes safer to ship.", useWhen: ["adding features", "fixing regressions", "changing behavior"], keywords: ["test", "regression", "behavior", "refactor", "api", "测试", "回归", "行为", "重构", "兼容"] },
  { id: "security", type: "rule", path: "rules/common/security.md", levels: standard, activation: "automatic", summary: "Checks trust boundaries, secrets, permissions, and untrusted input.", benefit: "Finds common security failures before release.", useWhen: ["authentication", "authorization", "handling secrets", "validating input"], keywords: ["security", "auth", "permission", "secret", "input", "安全", "认证", "权限", "密钥", "输入"] },
  { id: "code-review", type: "rule", path: "rules/common/code-review.md", levels: standard, activation: "explicit", summary: "Reviews changes for defects, regressions, security risks, and missing tests.", benefit: "Provides a release-focused second pass before merging.", useWhen: ["reviewing a diff", "before merging", "checking release readiness"], keywords: ["review", "diff", "merge", "release", "审查", "合并", "发布"] },
  { id: "performance", type: "rule", path: "rules/common/performance.md", levels: pro, activation: "automatic", summary: "Guides measurement-led performance work.", benefit: "Avoids premature optimization and targets real bottlenecks.", useWhen: ["profiling", "latency problems", "high memory or CPU usage"], keywords: ["performance", "slow", "latency", "memory", "cpu", "性能", "慢", "延迟", "内存"] },
  { id: "patterns", type: "rule", path: "rules/common/patterns.md", levels: pro, activation: "automatic", summary: "Applies maintainable implementation patterns when complexity warrants them.", benefit: "Keeps architecture consistent without over-engineering.", useWhen: ["designing modules", "repeated complexity", "cross-component changes"], keywords: ["pattern", "module", "architecture", "模式", "模块", "架构"] },
  { id: "context-budget", type: "skill", path: "skills/context-budget", levels: standard, activation: "explicit", summary: "Audits agent instructions, skills, and tools for context-window bloat.", benefit: "Reduces wasted tokens and conflicting guidance.", useWhen: ["agents feel distracted", "prompts are too large", "auditing context usage"], keywords: ["context", "token", "prompt", "上下文", "令牌", "提示词"] },
  { id: "agent-introspection-debugging", type: "skill", path: "skills/agent-introspection-debugging", levels: standard, activation: "explicit", summary: "Diagnoses why an AI agent failed before attempting recovery.", benefit: "Turns vague agent failures into evidence-backed fixes.", useWhen: ["an agent loops", "tool use fails", "agent behavior is inconsistent"], keywords: ["agent", "loop", "tool", "debug", "智能体", "循环", "工具", "调试"] },
  { id: "verification-loop", type: "skill", path: "skills/verification-loop", levels: standard, activation: "explicit", summary: "Runs a structured verification pass over completed work.", benefit: "Catches incomplete changes before handoff or release.", useWhen: ["after implementation", "before release", "before declaring work complete"], keywords: ["verify", "complete", "release", "验证", "完成", "发布"] },
  { id: "architecture-decision-records", type: "skill", path: "skills/architecture-decision-records", levels: pro, activation: "explicit", summary: "Captures important architecture choices and rejected alternatives.", benefit: "Preserves why a system was designed a certain way.", useWhen: ["choosing architecture", "making hard-to-reverse decisions", "comparing technical approaches"], keywords: ["architecture", "decision", "tradeoff", "架构", "决策", "取舍"] },
  { id: "agent-architecture-audit", type: "skill", path: "skills/agent-architecture-audit", levels: pro, activation: "explicit", summary: "Audits an agent setup for structural gaps and conflicting responsibilities.", benefit: "Improves reliability of multi-agent systems.", useWhen: ["designing agents", "reviewing agent boundaries", "scaling agent workflows"], keywords: ["agent architecture", "multi-agent", "智能体架构", "多智能体"] },
  { id: "codebase-onboarding", type: "skill", path: "skills/codebase-onboarding", levels: pro, activation: "explicit", summary: "Builds a reliable mental model of an unfamiliar repository.", benefit: "Shortens onboarding without guessing project conventions.", useWhen: ["joining a repository", "exploring unfamiliar code", "preparing major work"], keywords: ["onboard", "unfamiliar", "repository", "上手", "陌生", "代码库"] },
  { id: "security-scan", type: "skill", path: "skills/security-scan", levels: ["team"], activation: "explicit", summary: "Performs a focused security scan across a project.", benefit: "Finds release-blocking vulnerabilities and unsafe configuration.", useWhen: ["security review", "before production release", "after dependency changes"], keywords: ["security scan", "vulnerability", "production", "安全扫描", "漏洞", "生产"] },
  { id: "eval-harness", type: "skill", path: "skills/eval-harness", levels: ["team"], activation: "explicit", summary: "Designs repeatable evaluations for agent behavior.", benefit: "Makes agent quality measurable across prompt and model changes.", useWhen: ["evaluating agents", "comparing prompts", "preventing agent regressions"], keywords: ["eval", "benchmark", "prompt", "评估", "基准", "提示词"] }
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
    const selected = components.filter((item) => wanted.has(item.id));
    const unknown = ids.filter((id) => !selected.some((item) => item.id === id));
    if (unknown.length) throw new Error(`Unknown components: ${unknown.join(", ")}`);
    return selected;
  }
  if (!levels[level]) throw new Error(`Unknown level: ${level}`);
  return components.filter((item) => item.levels.includes(level));
}

export function componentById(id) {
  return components.find((item) => item.id === id);
}
