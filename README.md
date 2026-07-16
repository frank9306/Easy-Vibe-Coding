# Easy ECC

> Install the right parts of [Everything Claude Code (ECC)](https://github.com/affaan-m/ECC) for your experience level and AI coding agent—without copying the whole repository.

[简体中文](README.zh-CN.md) · [Documentation](https://frank9306.github.io/Easy-ECC/) · [ECC upstream](https://github.com/affaan-m/ECC)

Easy ECC is a cross-agent capability navigator and selective installer for Vibe Coding guardrails. It not only installs a focused set of ECC skills and rules, but also explains what is installed, when each capability helps, what benefit it provides, and which capability matches the task at hand.

## Why Easy ECC

Copying an entire agent configuration is easy. Understanding what it changes is not. Beginners need a few reliable guardrails; independent builders need testing and security; teams need governance and audit workflows. Easy ECC turns that difference into explicit installation profiles.

| Profile | Designed for | Includes |
| --- | --- | --- |
| `lite` | Vibe Coding beginners | Coding style, development workflow, Git safety |
| `standard` | Independent builders | Lite plus testing, security, review, context and verification |
| `pro` | Experienced developers | Standard plus architecture, patterns and maintainability |
| `team` | Teams and multi-agent projects | Pro plus security scanning and evaluation harnesses |
| `custom` | Users who know what they need | Only explicitly selected components |

Supported targets: Claude Code, Codex, Cursor, OpenCode, and generic Agent Skills clients. On clients without a standalone rules surface, Easy ECC packages each selected rule as a discoverable Agent Skill.

## Quick start

Requires Node.js 20 or newer.

```bash
npx easy-ecc-cli@latest install
```

Preview exactly what would be installed:

```bash
npx easy-ecc-cli@latest install --agent codex --level standard --dry-run
```

Choose individual components:

```bash
npx easy-ecc-cli@latest install --agent cursor --level custom \
  --components coding-style,git-workflow,security,verification-loop
```

Inspect or safely remove an installation:

```bash
npx easy-ecc-cli@latest status
npx easy-ecc-cli@latest uninstall
```

Understand a capability or get a local, privacy-preserving recommendation:

```bash
npx easy-ecc-cli@latest explain security
npx easy-ecc-cli@latest suggest "review authentication before release"
```

`status` presents managed capabilities by activation mode, checks whether installed files are healthy, modified, or missing, and also discovers project-local skills and plugin manifests that were not installed by Easy ECC. `suggest` uses an explainable local scenario matcher; task text is never uploaded.

The uninstaller checks SHA-256 hashes and keeps files that changed after installation.

## Commands

```text
easy-ecc install [--agent <name>] [--level <name>] [--components a,b]
                 [--dry-run] [--force] [--root <directory>]
easy-ecc list
easy-ecc status
easy-ecc explain <component>
easy-ecc suggest <task>
easy-ecc uninstall
```

When `--agent` is omitted, Easy ECC detects known project directories and otherwise uses the generic Agent Skills layout. When `--level` is omitted, an interactive terminal asks for it; non-interactive environments use `standard`.

## Safety and trust

- ECC content is pinned to `v2.0.0`, not a moving branch.
- The install plan is visible before network writes begin.
- Existing files are never overwritten unless `--force` is provided.
- Installed files and hashes are recorded in `.easy-ecc/state.json`.
- MCP servers and high-permission hooks are intentionally excluded from 0.1.0.

Easy ECC itself is MIT licensed. Downloaded ECC content remains governed by ECC's MIT License and upstream attribution. See [third-party notices](THIRD_PARTY_NOTICES.md).

## Scope of 0.1.0

This release adds the Capability Navigator: readable inventory, activation guidance, benefits, health checks, component explanations, and task-based recommendations. It does not claim runtime telemetry or prove that an agent invoked a skill; that requires platform-specific hooks. It also does not manage remote plugins, MCP servers, accounts, or global private configuration.

## Development

```bash
npm test
npm run check
node bin/easy-ecc.js install --agent codex --level lite --dry-run
```

## Acknowledgements

Easy ECC exists because of [Everything Claude Code](https://github.com/affaan-m/ECC) by Affaan Mustafa and its contributors. Easy ECC is an independent community project and is not affiliated with or endorsed by ECC or any AI agent vendor.

## License

[MIT](LICENSE)
