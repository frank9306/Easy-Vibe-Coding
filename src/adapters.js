import path from "node:path";

export const agents = ["claude", "codex", "cursor", "opencode", "generic"];

export function detectAgent(root, exists) {
  if (exists(path.join(root, ".claude"))) return "claude";
  if (exists(path.join(root, ".codex"))) return "codex";
  if (exists(path.join(root, ".cursor"))) return "cursor";
  if (exists(path.join(root, ".opencode"))) return "opencode";
  return "generic";
}

export function targetFor(agent, component, relative = "") {
  const filename = relative || path.basename(component.path);
  if (component.type === "rule") {
    if (agent === "claude") return path.join(".claude", "rules", filename);
    if (agent === "cursor") return path.join(".cursor", "rules", filename.replace(/\.md$/, ".mdc"));
    if (agent === "opencode") return path.join(".opencode", "skills", `ecc-${component.id}`, "SKILL.md");
    return path.join(".agents", "skills", `ecc-${component.id}`, "SKILL.md");
  }
  const roots = {
    claude: [".claude", "skills"],
    codex: [".agents", "skills"],
    cursor: [".cursor", "skills"],
    opencode: [".opencode", "skills"],
    generic: [".agents", "skills"]
  };
  return path.join(...roots[agent], component.id, relative);
}
