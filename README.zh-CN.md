# Easy ECC

> 根据你的使用经验和 AI Coding Agent，选择性安装 [Everything Claude Code（ECC）](https://github.com/affaan-m/ECC) 中真正需要的部分，而不是复制整个仓库。

[English](README.md) · [在线文档](https://frank9306.github.io/Easy-ECC/) · [ECC 上游仓库](https://github.com/affaan-m/ECC)

Easy ECC 是一个面向 Vibe Coding 的分级、跨 Agent 安装工具。ECC 提供了数量庞大的 Skills、Rules 和工程工作流；Easy ECC 补上易用性这一层：按人群划分安装级别、在写入前展示安装计划、适配不同 Agent 的目录、固定上游版本，并支持安全卸载。

## 核心价值

复制一整套 Agent 配置很容易，理解它会改变什么却很难。初学者只需要最关键的安全护栏，独立开发者需要测试和安全检查，团队则需要治理和审计。Easy ECC 把这些差异整理成清晰、可检查的安装预设。

| 级别 | 适用人群 | 默认内容 |
| --- | --- | --- |
| `lite` | Vibe Coding 初学者 | 编码风格、开发流程、Git 安全 |
| `standard` | 独立开发者 | Lite + 测试、安全、审查、上下文与验证 |
| `pro` | 专业开发者 | Standard + 架构、模式与可维护性 |
| `team` | 团队和多 Agent 项目 | Pro + 安全扫描与评估 Harness |
| `custom` | 熟悉自身需求的用户 | 只安装明确选择的组件 |

支持 Claude Code、Codex、Cursor、OpenCode，以及兼容 Agent Skills 的通用客户端。对于没有独立 Rules 机制的平台，Easy ECC 会将规则包装成可发现的 Agent Skill。

## 快速开始

需要 Node.js 20 或更高版本。

```bash
npx easy-ecc-cli@0.0.1 install
```

先预览将要安装的准确内容：

```bash
npx easy-ecc-cli@0.0.1 install --agent codex --level standard --dry-run
```

自定义选择组件：

```bash
npx easy-ecc-cli@0.0.1 install --agent cursor --level custom \
  --components coding-style,git-workflow,security,verification-loop
```

查看状态或安全卸载：

```bash
npx easy-ecc-cli@0.0.1 status
npx easy-ecc-cli@0.0.1 uninstall
```

卸载时会检查 SHA-256；安装后被修改过的文件将被保留，不会误删。

## 安全与可信性

- ECC 内容固定在 `v2.0.0`，不直接追踪持续变化的分支。
- 网络写入开始前会展示完整安装计划。
- 默认不覆盖已有文件；只有显式传入 `--force` 才会覆盖。
- `.easy-ecc/state.json` 记录已安装文件及其校验值。
- 0.0.1 有意不自动安装 MCP Server 和高权限 Hooks。

Easy ECC 本身使用 MIT License。下载的 ECC 内容继续遵循 ECC 的 MIT License 和上游署名要求，详见[第三方声明](THIRD_PARTY_NOTICES.md)。

## 0.0.1 的边界

首个版本用于验证“分级、选择性安装”模式，只安装 ECC 的通用规则和一组经过筛选、可独立使用的 Skills。它不会假装所有平台完全相同，也不会尝试转换 ECC 的全部 Commands、Hooks、Agents 或 MCP 配置。

## 本地开发

```bash
npm test
npm run check
node bin/easy-ecc.js install --agent codex --level lite --dry-run
```

## 致谢与关系说明

Easy ECC 基于 Affaan Mustafa 及贡献者维护的 [Everything Claude Code](https://github.com/affaan-m/ECC) 才得以成立。Easy ECC 是独立社区项目，不隶属于 ECC，也不代表任何 AI Agent 厂商。

## License

[MIT](LICENSE)
