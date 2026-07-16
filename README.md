# Easy ECC

> Install the right parts of [Everything Claude Code (ECC)](https://github.com/affaan-m/ECC) for your experience level and AI coding agent—without copying the whole repository.

[简体中文](README.zh-CN.md) · [Documentation](https://frank9306.github.io/Easy-ECC/) · [ECC upstream](https://github.com/affaan-m/ECC)

Easy ECC is a selective, cross-agent installer for Vibe Coding guardrails. ECC is a broad agent harness system with hundreds of reusable skills, rules, and workflows. Easy ECC adds the missing onboarding layer: understandable profiles, a reviewable install plan, platform-aware destinations, pinned upstream content, and safe removal.

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

The uninstaller checks SHA-256 hashes and keeps files that changed after installation.

## Commands

```text
easy-ecc install [--agent <name>] [--level <name>] [--components a,b]
                 [--dry-run] [--force] [--root <directory>]
easy-ecc list
easy-ecc status
easy-ecc uninstall
```

When `--agent` is omitted, Easy ECC detects known project directories and otherwise uses the generic Agent Skills layout. When `--level` is omitted, an interactive terminal asks for it; non-interactive environments use `standard`.

## Safety and trust

- ECC content is pinned to `v2.0.0`, not a moving branch.
- The install plan is visible before network writes begin.
- Existing files are never overwritten unless `--force` is provided.
- Installed files and hashes are recorded in `.easy-ecc/state.json`.
- MCP servers and high-permission hooks are intentionally excluded from 0.0.2.

Easy ECC itself is MIT licensed. Downloaded ECC content remains governed by ECC's MIT License and upstream attribution. See [third-party notices](THIRD_PARTY_NOTICES.md).

## Scope of 0.0.2

This first release proves the selective installation model. It installs common ECC rules and a curated set of self-contained skills. It does not attempt to translate every ECC command, hook, agent, or MCP configuration across incompatible runtimes.

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
