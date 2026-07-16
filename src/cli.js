import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { agents, detectAgent } from "./adapters.js";
import { componentById, components, levels } from "./catalog.js";
import { suggest, suggestedPrompt } from "./advisor.js";
import { readInventory } from "./inventory.js";
import { buildPlan, install, uninstall } from "./installer.js";

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

function help() {
  console.log(`Easy ECC 0.1.0\n\nUsage:\n  easy-ecc install [--agent <name>] [--level <name>] [--components a,b] [--dry-run] [--force]\n  easy-ecc list\n  easy-ecc status\n  easy-ecc explain <component>\n  easy-ecc suggest <task>\n  easy-ecc uninstall\n\nAgents: ${agents.join(", ")}\nLevels: ${Object.keys(levels).join(", ")}`);
}

function printComponent(component, indent = "") {
  console.log(`${indent}${component.id} [${component.activation}]`);
  console.log(`${indent}  What: ${component.summary}`);
  console.log(`${indent}  When: ${component.useWhen.join("; ")}`);
  console.log(`${indent}  Benefit: ${component.benefit}`);
}

async function promptChoice(question, choices, defaultValue) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} (${choices.join("/")}) [${defaultValue}]: `);
  rl.close();
  const value = answer.trim() || defaultValue;
  if (!choices.includes(value)) throw new Error(`Invalid choice: ${value}`);
  return value;
}

export async function run(args) {
  const command = args[0] || "help";
  const root = path.resolve(option(args, "--root", process.cwd()));
  if (["help", "--help", "-h"].includes(command)) return help();
  if (command === "list") {
    console.log("Levels:");
    for (const [name, description] of Object.entries(levels)) console.log(`  ${name.padEnd(9)} ${description}`);
    console.log("\nComponents:");
    for (const item of components) console.log(`  ${item.id.padEnd(30)} ${item.type.padEnd(6)} ${item.summary}`);
    return;
  }
  if (command === "status") {
    const inventory = readInventory(root);
    if (!inventory.state && !inventory.unmanaged.length && !inventory.plugins.length) return console.log("No Easy ECC installation or discoverable project skills or plugins found.");
    if (inventory.state) console.log(`Easy ECC ${inventory.state.version} · ${inventory.state.agent} · ${inventory.state.level}\n`);
    if (inventory.managed.length) {
      console.log(`Managed capabilities (${inventory.managed.length})`);
      for (const activation of ["always", "automatic", "explicit"]) {
        const items = inventory.managed.filter((item) => item.activation === activation);
        if (!items.length) continue;
        console.log(`\n${activation.toUpperCase()}`);
        for (const item of items) {
          printComponent(item, "  ");
          console.log(`    Health: ${item.health}`);
        }
      }
    }
    if (inventory.unmanaged.length) {
      console.log(`\nUnmanaged project skills (${inventory.unmanaged.length})`);
      for (const item of inventory.unmanaged) console.log(`  ${item.id}: ${item.description}\n    Path: ${item.path}`);
    }
    if (inventory.plugins.length) {
      console.log(`\nProject plugins (${inventory.plugins.length})`);
      for (const item of inventory.plugins) console.log(`  ${item.id}${item.version ? `@${item.version}` : ""}: ${item.description}\n    Manifest: ${item.path}`);
    }
    const health = inventory.managed.reduce((counts, item) => ({ ...counts, [item.health]: (counts[item.health] || 0) + 1 }), {});
    if (inventory.managed.length) console.log(`\nHealth: ${health.healthy || 0} healthy · ${health.modified || 0} modified · ${health.missing || 0} missing`);
    return;
  }
  if (command === "explain") {
    const id = args[1];
    const component = componentById(id);
    if (!component) throw new Error(`Unknown component: ${id || "(missing)"}`);
    printComponent(component);
    console.log(`  Type: ${component.type}\n  Included in: ${component.levels.join(", ")}`);
    return;
  }
  if (command === "suggest") {
    const taskParts = [];
    for (let index = 1; index < args.length; index += 1) {
      if (args[index] === "--root") { index += 1; continue; }
      taskParts.push(args[index]);
    }
    const task = taskParts.join(" ").trim();
    if (!task) throw new Error("suggest requires a task description");
    const inventory = readInventory(root);
    const installedIds = inventory.managed.map((item) => item.id);
    const recommendations = suggest(task, installedIds);
    if (!recommendations.length) return console.log("No confident match. Run 'easy-ecc list' to browse available capabilities.");
    console.log("Recommended capabilities\n");
    for (const item of recommendations.slice(0, 5)) {
      console.log(`${item.installed ? "INSTALLED" : "AVAILABLE"}  ${item.component.id}`);
      console.log(`  Why: ${item.component.summary}`);
      console.log(`  Benefit: ${item.component.benefit}`);
    }
    const prompt = suggestedPrompt(recommendations, task);
    if (prompt) console.log(`\nSuggested prompt:\n  ${prompt}`);
    return;
  }
  if (command === "uninstall") {
    const result = uninstall(root);
    console.log(`Removed ${result.removed.length} files. Kept ${result.kept.length} modified files.`);
    if (result.kept.length) console.log(`Modified files kept:\n${result.kept.map((item) => `  ${item}`).join("\n")}`);
    return;
  }
  if (command !== "install") throw new Error(`Unknown command: ${command}`);

  let agent = option(args, "--agent", detectAgent(root, fs.existsSync));
  let level = option(args, "--level");
  if (!agents.includes(agent)) throw new Error(`Unknown agent: ${agent}`);
  if (!level && process.stdin.isTTY) level = await promptChoice("Installation level", Object.keys(levels), "standard");
  level ||= "standard";
  const componentIds = (option(args, "--components", "") || "").split(",").filter(Boolean);
  if (level === "custom" && componentIds.length === 0) throw new Error("Custom level requires --components");
  const plan = buildPlan({ agent, level, componentIds });
  console.log(`Easy ECC plan: ${agent} / ${level} / ECC v2.0.0`);
  for (const item of plan) console.log(`  ${item.component.id} -> ${item.target}`);
  if (args.includes("--dry-run")) return;
  const records = await install({ root, agent, level, componentIds, force: args.includes("--force") });
  const installed = [...new Set(records.map((record) => record.component))];
  const always = installed.filter((id) => componentById(id).activation === "always");
  const onDemand = installed.filter((id) => componentById(id).activation !== "always");
  console.log(`Installed ${installed.length} capabilities (${records.length} files).`);
  if (always.length) console.log(`Always active: ${always.join(", ")}`);
  if (onDemand.length) console.log(`Available when relevant: ${onDemand.join(", ")}`);
  console.log("Next: run 'easy-ecc status' or 'easy-ecc suggest \"describe your task\"'.");
}
