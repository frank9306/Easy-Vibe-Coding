import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { selectComponents } from "../src/catalog.js";
import { buildPlan, install, uninstall } from "../src/installer.js";
import { targetFor } from "../src/adapters.js";

const portable = (value) => value.replaceAll("\\", "/");

test("profiles are cumulative and increasingly capable", () => {
  const counts = ["lite", "standard", "pro", "team"].map((level) => selectComponents(level).length);
  assert.deepEqual(counts, [3, 9, 14, 16]);
});

test("custom profile selects only requested components", () => {
  assert.deepEqual(selectComponents("custom", ["security"]).map((item) => item.id), ["security"]);
});

test("Codex skills use the Agent Skills project directory", () => {
  const skill = selectComponents("custom", ["context-budget"])[0];
  assert.equal(portable(targetFor("codex", skill, "SKILL.md")), ".agents/skills/context-budget/SKILL.md");
});

test("Codex rules are exposed as discoverable Agent Skills", () => {
  const rule = selectComponents("custom", ["security"])[0];
  assert.equal(portable(targetFor("codex", rule, "security.md")), ".agents/skills/ecc-security/SKILL.md");
});

test("dry-run plan is deterministic and pinned", () => {
  const plan = buildPlan({ agent: "claude", level: "lite" });
  assert.equal(plan.length, 3);
  assert.match(plan[0].source, /\/v2\.0\.0\//);
});

test("uninstall preserves files changed by the user", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "easy-ecc-"));
  const fetcher = async () => ({ ok: true, text: async () => "# Upstream rule\n" });
  try {
    await install({ root, agent: "codex", level: "custom", componentIds: ["coding-style"], fetcher });
    const installed = path.join(root, ".agents", "skills", "ecc-coding-style", "SKILL.md");
    fs.appendFileSync(installed, "\nUser change\n");
    const result = uninstall(root);
    assert.deepEqual(result.kept.map(portable), [".agents/skills/ecc-coding-style/SKILL.md"]);
    assert.equal(fs.existsSync(installed), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("documentation page contains product, upstream and install affordances", () => {
  const html = fs.readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
  assert.match(html, /Easy ECC/);
  assert.match(html, /github\.com\/affaan-m\/ECC/);
  assert.match(html, /npx easy-ecc-cli@latest install/);
  assert.doesNotMatch(html, /npx easy-ecc-cli@\d+\.\d+\.\d+/);
  assert.match(html, /id="profiles"/);
});
