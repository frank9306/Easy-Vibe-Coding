import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { agents, detectAgent } from "./adapters.js";
import { components, levels } from "./catalog.js";
import { buildPlan, install, uninstall } from "./installer.js";

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

function help() {
  console.log(`Easy ECC 0.0.1\n\nUsage:\n  easy-ecc install [--agent <name>] [--level <name>] [--components a,b] [--dry-run] [--force]\n  easy-ecc list\n  easy-ecc status\n  easy-ecc uninstall\n\nAgents: ${agents.join(", ")}\nLevels: ${Object.keys(levels).join(", ")}`);
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
    for (const item of components) console.log(`  ${item.id.padEnd(30)} ${item.type}`);
    return;
  }
  if (command === "status") {
    const state = path.join(root, ".easy-ecc", "state.json");
    console.log(fs.existsSync(state) ? fs.readFileSync(state, "utf8") : "Easy ECC is not installed in this project.");
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
  console.log(`Installed ${records.length} files. Run 'easy-ecc status' for details.`);
}
