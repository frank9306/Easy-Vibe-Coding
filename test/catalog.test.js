import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { selectComponents } from "../src/catalog.js";
import { buildPlan, install, uninstall } from "../src/installer.js";
import { targetFor } from "../src/adapters.js";
import { suggest, suggestedPrompt } from "../src/advisor.js";
import { readInventory } from "../src/inventory.js";

const portable = (value) => value.replaceAll("\\", "/");

test("profiles are cumulative and increasingly capable", () => {
  const counts = ["lite", "standard", "pro", "team"].map((level) => selectComponents(level).length);
  assert.deepEqual(counts, [3, 9, 14, 16]);
});

test("custom profile selects only requested components", () => {
  assert.deepEqual(selectComponents("custom", ["security"]).map((item) => item.id), ["security"]);
});

test("custom profile rejects unknown components", () => {
  assert.throws(() => selectComponents("custom", ["not-real"]), /Unknown components: not-real/);
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

test("installed rule descriptions explain triggers and benefits", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "easy-ecc-"));
  const fetcher = async () => ({ ok: true, text: async () => "# Upstream rule\n" });
  try {
    await install({ root, agent: "codex", level: "custom", componentIds: ["security"], fetcher });
    const content = fs.readFileSync(path.join(root, ".agents", "skills", "ecc-security", "SKILL.md"), "utf8");
    assert.match(content, /Use when authentication/);
    assert.match(content, /Benefit: Finds common security failures/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("advisor recommends installed capabilities and identifies available ones", () => {
  const recommendations = suggest("Review authentication security before release", ["security"]);
  assert.equal(recommendations[0].component.id, "security");
  assert.equal(recommendations[0].installed, true);
  assert.equal(recommendations.some((item) => item.component.id === "code-review" && !item.installed), true);
  assert.match(suggestedPrompt(recommendations, "Review authentication security before release"), /Use security/);
});

test("advisor connects refactoring and API compatibility to regression testing", () => {
  const recommendations = suggest("我要重构支付模块，不能影响现有 API", ["testing"]);
  assert.equal(recommendations[0].component.id, "testing");
  assert.equal(recommendations[0].installed, true);
});

test("inventory explains managed capabilities, health, and unmanaged project skills", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "easy-ecc-"));
  const fetcher = async () => ({ ok: true, text: async () => "# Upstream rule\n" });
  try {
    await install({ root, agent: "codex", level: "custom", componentIds: ["security"], fetcher });
    const custom = path.join(root, ".agents", "skills", "my-skill");
    fs.mkdirSync(custom, { recursive: true });
    fs.writeFileSync(path.join(custom, "SKILL.md"), "---\nname: my-skill\ndescription: Helps with a custom workflow.\n---\n");
    const plugin = path.join(root, "plugins", "my-plugin", ".codex-plugin");
    fs.mkdirSync(plugin, { recursive: true });
    fs.writeFileSync(path.join(plugin, "plugin.json"), JSON.stringify({ name: "my-plugin", version: "1.2.3", description: "Adds a local project tool." }));
    const inventory = readInventory(root);
    assert.equal(inventory.managed.length, 1);
    assert.equal(inventory.managed[0].health, "healthy");
    assert.equal(inventory.unmanaged[0].id, "my-skill");
    assert.equal(inventory.unmanaged[0].description, "Helps with a custom workflow.");
    assert.equal(inventory.plugins[0].id, "my-plugin");
    assert.equal(inventory.plugins[0].version, "1.2.3");
    assert.equal(inventory.plugins[0].description, "Adds a local project tool.");
    assert.equal(portable(inventory.plugins[0].path), "plugins/my-plugin/.codex-plugin/plugin.json");
    const installed = path.join(root, ".agents", "skills", "ecc-security", "SKILL.md");
    fs.appendFileSync(installed, "\nUser change\n");
    assert.equal(readInventory(root).managed[0].health, "modified");
    fs.unlinkSync(installed);
    assert.equal(readInventory(root).managed[0].health, "missing");
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
  assert.match(html, /id="navigator"/);
  assert.match(html, /easy-ecc suggest/);
});
