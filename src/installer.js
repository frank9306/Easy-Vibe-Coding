import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ECC, selectComponents } from "./catalog.js";
import { targetFor } from "./adapters.js";

const rawBase = `https://raw.githubusercontent.com/${ECC.owner}/${ECC.repo}/${ECC.version}`;
const apiBase = `https://api.github.com/repos/${ECC.owner}/${ECC.repo}/contents`;

export function buildPlan({ agent, level, componentIds = [] }) {
  return selectComponents(level, componentIds).map((component) => ({
    component,
    source: `${rawBase}/${component.path}`,
    target: targetFor(agent, component)
  }));
}

async function getFiles(component, fetcher) {
  if (component.type === "rule") {
    const response = await fetcher(`${rawBase}/${component.path}`);
    if (!response.ok) throw new Error(`ECC download failed (${response.status}): ${component.path}`);
    const upstream = await response.text();
    const content = `---\nname: ecc-${component.id}\ndescription: ECC ${component.id} engineering guidance installed by Easy ECC.\n---\n\n${upstream}`;
    return [{ relative: path.basename(component.path), content }];
  }
  const response = await fetcher(`${apiBase}/${component.path}?ref=${ECC.version}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "easy-ecc" }
  });
  if (!response.ok) throw new Error(`ECC catalog failed (${response.status}): ${component.path}`);
  const entries = await response.json();
  const files = [];
  for (const entry of entries) {
    if (entry.type === "file") {
      const fileResponse = await fetcher(entry.download_url);
      if (!fileResponse.ok) throw new Error(`ECC download failed (${fileResponse.status}): ${entry.path}`);
      files.push({ relative: entry.name, content: await fileResponse.text() });
    }
  }
  return files;
}

function digest(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function install({ root, agent, level, componentIds = [], force = false, fetcher = fetch }) {
  const selected = selectComponents(level, componentIds);
  const records = [];
  for (const component of selected) {
    const files = await getFiles(component, fetcher);
    for (const file of files) {
      const target = path.join(root, targetFor(agent, component, file.relative));
      if (fs.existsSync(target) && !force) throw new Error(`Refusing to overwrite ${path.relative(root, target)}; use --force`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.content, "utf8");
      records.push({ component: component.id, path: path.relative(root, target), sha256: digest(file.content) });
    }
  }
  const stateDir = path.join(root, ".easy-ecc");
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(path.join(stateDir, "state.json"), JSON.stringify({ version: "0.0.1", ecc: ECC.version, agent, level, files: records }, null, 2) + "\n");
  return records;
}

export function uninstall(root) {
  const statePath = path.join(root, ".easy-ecc", "state.json");
  if (!fs.existsSync(statePath)) throw new Error("No Easy ECC installation found");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const kept = [];
  const removed = [];
  for (const record of state.files) {
    const target = path.join(root, record.path);
    if (!fs.existsSync(target)) continue;
    const content = fs.readFileSync(target);
    if (digest(content) !== record.sha256) kept.push(record.path);
    else { fs.unlinkSync(target); removed.push(record.path); }
  }
  fs.rmSync(statePath);
  return { removed, kept };
}
