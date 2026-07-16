import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { componentById } from "./catalog.js";

function digest(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function readFrontMatter(file) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const block = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const value = (name) => block?.[1].match(new RegExp(`^${name}:\\s*["']?(.+?)["']?$`, "m"))?.[1];
    return { name: value("name"), description: value("description") };
  } catch {
    return {};
  }
}

function discoverSkills(root) {
  const roots = [
    [".agents", "skills"], [".claude", "skills"], [".cursor", "skills"], [".opencode", "skills"]
  ];
  const found = [];
  for (const parts of roots) {
    const directory = path.join(root, ...parts);
    if (!fs.existsSync(directory)) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(directory, entry.name, "SKILL.md");
      if (!fs.existsSync(file)) continue;
      const frontMatter = readFrontMatter(file);
      found.push({ id: frontMatter.name || entry.name, description: frontMatter.description || "No description available", path: path.relative(root, file) });
    }
  }
  return found;
}

function pluginFromManifest(root, file) {
  try {
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    return {
      id: manifest.name || path.basename(path.dirname(file)),
      description: manifest.description || "No description available",
      version: manifest.version,
      path: path.relative(root, file)
    };
  } catch {
    return undefined;
  }
}

function discoverPlugins(root) {
  const candidates = [path.join(root, ".codex-plugin", "plugin.json")];
  for (const parts of [["plugins"], [".codex", "plugins"], [".claude", "plugins"], [".opencode", "plugins"]]) {
    const directory = path.join(root, ...parts);
    if (!fs.existsSync(directory)) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      candidates.push(path.join(directory, entry.name, ".codex-plugin", "plugin.json"));
      candidates.push(path.join(directory, entry.name, "plugin.json"));
    }
  }
  return candidates.filter((file) => fs.existsSync(file)).map((file) => pluginFromManifest(root, file)).filter(Boolean);
}

export function readInventory(root) {
  const statePath = path.join(root, ".easy-ecc", "state.json");
  let state;
  if (fs.existsSync(statePath)) state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const managedById = new Map();
  for (const record of state?.files || []) {
    const file = path.join(root, record.path);
    const health = !fs.existsSync(file) ? "missing" : digest(fs.readFileSync(file)) === record.sha256 ? "healthy" : "modified";
    const existing = managedById.get(record.component);
    const statuses = [...(existing?.statuses || []), health];
    const aggregate = statuses.includes("missing") ? "missing" : statuses.includes("modified") ? "modified" : "healthy";
    managedById.set(record.component, { ...componentById(record.component), id: record.component, paths: [...(existing?.paths || []), record.path], statuses, health: aggregate });
  }
  const managed = [...managedById.values()];
  const managedPaths = new Set(managed.flatMap((item) => item.paths).map((item) => path.normalize(item)));
  const unmanaged = discoverSkills(root).filter((item) => !managedPaths.has(path.normalize(item.path)));
  return { state, managed, unmanaged, plugins: discoverPlugins(root) };
}
