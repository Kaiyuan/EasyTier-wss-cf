# EasyTier WebSocket Relay for Cloudflare Workers

## 项目简介

# 项目只是一个雏形，完全未可用！！！

该项目是 EasyTier 的第三方服务端实现。EasyTier 是一个去中心化 P2P 组网程序，官方代码使用 Rust 实现。本项目使用 Cloudflare Worker + Durable Object 实现了 JavaScript 版本的 WebSocket 服务端，支持网络转发与 P2P 打洞信息交换。

项目使用 Claude 进行开发，目前处于早期阶段，还存在很多问题，欢迎提交代码或 issue。

> **注意：本项目仅供学习交流使用**

## 技术架构

- 基于 Cloudflare Workers 和 Durable Objects
- 使用 WebSocket 协议进行实时通信
- 采用 Protocol Buffers 进行高效序列化
- 支持消息加密与完整性保护
- 模块化设计，便于扩展和维护

## 开发环境搭建

### 前置要求

- Node.js (>= 16.0.0)
- pnpm (推荐) 或 npm
- Wrangler CLI (Cloudflare Workers 工具链)

### 安装步骤

1. 克隆项目仓库：
```bash
git clone <your-repo-url>
cd easytier-ws-relay
```

2. 安装依赖：
```bash
pnpm install
# 或者使用 npm
npm install
```

3. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

4. 登录 Cloudflare：
```bash
wrangler login
```

## 本地开发

### 启动开发服务器

```bash
# 启动本地开发服务器
pnpm run dev
# 或者
wrangler dev --ip 0.0.0.0
```

### 直接启动（不监听文件变化）

```bash
pnpm run start
# 或者
wrangler dev
```

## 部署到 Cloudflare

### 部署命令

```bash
# 部署到 Cloudflare Workers
wrangler deploy
```

### 配置说明

项目使用 `wrangler.toml` 文件进行基础配置，敏感参数建议通过 Cloudflare 控制台设置。

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WS_PATH` | WebSocket 路径 | `ws` |
| `EASYTIER_DISABLE_RELAY` | `"1"` 开启纯 P2P 模式 | `"0"` |
| `EASYTIER_COMPRESS_RPC` | `"0"` 关闭 RPC 压缩（调试用） | `"1"` |
| `LOCATION_HINT` | Durable Object 地区，见下表 | `"apac"` |
| `ADMIN_PASSWORD` | **管理后台登录密码**（见下方说明） | `"changeme"` |

### 设置管理后台密码（重要）

部署后请立即在 **Cloudflare 控制台** 中将 `ADMIN_PASSWORD` 设置为您的自定义密码：

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → 选择您的 Worker → **Settings** → **Variables and Secrets**
3. 添加变量 `ADMIN_PASSWORD`，输入您的密码，选择 **Secret** 类型（加密存储）
4. 保存后重新部署生效

> **请勿将真实密码提交到代码仓库。** 使用 Cloudflare Secret 可确保密码加密存储，不会在日志中暴露。

管理后台地址：`https://your-worker.workers.dev/panel`（或你在 Cloudflare 里绑定的自定义域名加上 `/panel`，例如 `https://your-domain.com/panel`）

> 说明：这个开源仓库**不会**在 `wrangler.toml` 中绑定任何固定域名。每个使用者都应当在自己的 Cloudflare Dashboard 里，为自己的域名单独添加 Worker Route / Custom Domain。

## 项目结构

```
easytier-ws-relay/
├── protos/                 # Protocol Buffers 定义
│   ├── google
│   │   └── protobuf
│   │       └── timestamp.proto
│   ├── common.proto        # 通用协议定义
│   ├── error.proto         # 错误协议定义
│   └── peer_rpc.proto      # 对等节点 RPC 协议定义
├── src/
│   ├── worker/             # Worker 实现
│   │   ├── core/           # Worker 核心功能
│   │   │   ├── basic_handlers.js   # 基础处理器
│   │   │   ├── compress.js         # 压缩功能
│   │   │   ├── constants.js        # 常量定义
│   │   │   ├── crypto.js           # 加密功能
│   │   │   ├── packet.js           # 数据包处理
│   │   │   ├── peer_manager.js     # 对等节点管理
│   │   │   ├── protos.js           # Protobuf 相关功能
│   │   │   ├── protos_generated.js # Protobuf 生成的代码
│   │   │   └── rpc_handler.js      # RPC 处理器
│   │   └── relay_room.js           # 中继房间实现
│   ├── admin_i18n/                 # 管理后台多语言（locales/、login/）
│   ├── ws_url.js                   # WSS 节点地址构建工具
│   ├── config_public.js            # 管理 API 配置脱敏
│   └── worker.js                   # Worker 入口文件
├── test/                           # 单元测试
├── package.json            # 项目配置
├── wrangler.toml           # Cloudflare Workers 配置
└── README.md               # 项目说明
```

## 功能特性

- WebSocket 双向通信中继
- 基于 Room 的连接管理
- 使用 Protobuf 进行高效序列化
- 消息加密与完整性保护
- 客户端状态管理与心跳维持
- RPC 请求/响应处理机制

## 纯 P2P 模式

在 `wrangler.toml` 的 `[vars]` 中配置：
- `EASYTIER_DISABLE_RELAY`: `"1"` 开启纯 P2P，默认 `"0"`
- `EASYTIER_COMPRESS_RPC`: `"0"` 关闭 RPC 压缩（调试用），默认 `"1"`

修改完配置后按正常方式运行 `wrangler dev` 或部署即可生效。

## Durable Object 地区配置

Durable Object 默认会根据请求来源自动选择最近的地区部署。如需指定地区，可在 `wrangler.toml` 的 `[vars]` 中配置：

- `LOCATION_HINT`: Durable Object 的位置提示，可选值如下：

| 参数 | 地区 |
|------|------|
| `wnam` | 西部地区（北美） |
| `enam` | 东部地区（北美） |
| `sam` | 南美洲 |
| `weur` | 西欧 |
| `eeur` | 东欧 |
| `apac` | 亚太地区（默认） |
| `oc` | 大洋洲 |
| `afr` | 非洲 |
| `me` | 中东 |

> 详细说明请参考 [Cloudflare 官方文档](https://developers.cloudflare.com/durable-objects/reference/data-location/#supported-locations-1)

修改完配置后按正常方式运行 `wrangler dev` 或部署即可生效。

## 客户端连接说明（WSS 节点）

部署后，EasyTier 客户端通过 **对等节点（peer）** 连接本中继，地址格式如下：

| 参数 | 说明 |
|------|------|
| 路径 | `/{WS_PATH}`，默认 `/ws`，可在 `wrangler.toml` 的 `WS_PATH` 修改 |
| `room` | 房间 ID，同一房间内的节点可互相发现与转发，默认 `default` |
| `token` | 客户端连接令牌；在管理后台开启「强制令牌」后必填 |

EasyTier 使用端口 `0` 表示协议默认端口（`ws`→80，`wss`→443）。

**开发环境示例：**

```text
ws://127.0.0.1:8787/ws?room=my_net&token=你的客户端令牌
```

**生产环境示例：**

```text
wss://your-deployment.workers.dev:0/ws?room=my_net&token=你的客户端令牌
```

绑定自定义域名时，将主机名替换为你的域名即可。

**easytier-core 命令示例：**

```bash
easytier-core --network-name '你的网络名' --network-secret '你的密钥' -p 'wss://your-domain:0/ws?room=my_net&token=你的令牌'
```

管理后台「EasyTier 节点配置」页可保存上述地址，并在填写网络名/密钥后一键复制完整 CLI 命令。创建客户端令牌后也会提示带 `room=default` 的示例 WSS 地址。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进本项目。

## 许可证

[MIT License](./LICENSE)

## 免责声明

本项目仅供学习交流使用，请勿用于任何商业用途或非法用途。使用本项目代码造成的任何后果，原作者概不负责。
