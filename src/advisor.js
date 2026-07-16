import { components } from "./catalog.js";

export function suggest(task, installedIds = []) {
  const query = task.toLowerCase();
  const installed = new Set(installedIds);
  return components
    .map((component) => ({
      component,
      score: component.keywords.reduce((score, keyword) => score + (query.includes(keyword.toLowerCase()) ? 1 : 0), 0),
      installed: installed.has(component.id)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.installed) - Number(a.installed) || a.component.id.localeCompare(b.component.id));
}

export function suggestedPrompt(items, task) {
  const installed = items.filter((item) => item.installed).slice(0, 3).map((item) => item.component.id);
  if (!installed.length) return "";
  return `Use ${installed.join(", ")} for this task: ${task}`;
}
