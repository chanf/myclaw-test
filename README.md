# AI Note - 智能笔记应用

一个基于 AI 的沉浸式笔记应用，支持 Markdown 编辑、文件夹分类、标签系统和 AI 辅助写作功能。

## 🚀 快速部署

| 部署平台 | 链接 |
|-----------|------|
| **本地部署** | [QUICKSTART.md](QUICKSTART.md) |
| **Cloudflare** | [CLOUDFLARE_QUICKSTART.md](CLOUDFLARE_QUICKSTART.md) ⚠️ |
| **Railway** | [DEPLOYMENT.md](DEPLOYMENT.md) |

> **注意**：Cloudflare 部署需要将后端从 Express 重构为 Hono，详见 [CLOUDFLARE_STATUS.md](CLOUDFLARE_STATUS.md)

## 技术栈

### 前端
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Framer Motion (动画)
- @uiw/react-md-editor (Markdown 编辑器)
- Lucide React (图标)

### 后端
- Node.js
- Express
- TypeScript
- SQLite (better-sqlite3)
- Azure OpenAI API

## 功能特性

### 核心功能
- ✅ Markdown 编辑器（支持实时预览）
- ✅ 沉浸式写作模式（Cmd+Shift+F）
- ✅ 文件夹分类（多级文件夹）
- ✅ 笔记标签系统
- ✅ 全文搜索
- ✅ 导出功能
- ✅ 夜间模式
- ✅ 自动保存

### AI 辅助功能
- ✅ 续写 - AI 自动续写内容
- ✅ 优化 - 改进文本质量
- ✅ 总结 - 生成内容摘要
- ✅ 翻译 - 翻译成其他语言
- ✅ 改写 - 改变写作风格

## 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

#### 服务端
```bash
cd server
npm install
```

#### 客户端
```bash
cd client
npm install
```

### 配置环境变量

#### 服务端 (.env)
```env
PORT=3001
DB_PATH=./data/notes.db
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_API_VERSION=2024-05-01-preview
AZURE_DEPLOYMENT_NAME=Gpt-4o
```

#### 客户端 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 启动应用

#### 启动服务端
```bash
cd server
npm run dev
```

服务端将在 `http://localhost:3001` 启动

#### 启动客户端
```bash
cd client
npm run dev
```

客户端将在 `http://localhost:3000` 启动

### 生产构建

#### 服务端
```bash
cd server
npm run build
npm start
```

#### 客户端
```bash
cd client
npm run build
npm start
```

## 部署到 Cloudflare

项目支持一键部署到 Cloudflare：

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 运行部署脚本
./deploy-cloudflare.sh
```

详细部署文档请参考 [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)

### Cloudflare 部署说明

- **前端**：Cloudflare Pages (Next.js)
- **后端**：Cloudflare Workers (需要使用 Hono 重构)
- **数据库**：Cloudflare D1 (SQLite)

**注意**：Cloudflare Workers 不支持 Express，需要使用 Hono 框架重写后端代码。详见 Cloudflare 部署文档。

## 项目结构

```
myclaw-test/
├── client/                 # Next.js 前端
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React 组件
│   │   ├── lib/          # 工具库和 API 客户端
│   │   ├── store/        # Zustand 状态管理
│   │   └── types/        # TypeScript 类型定义
│   └── package.json
│
├── server/                # Express 后端
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── db/          # 数据库
│   │   ├── routes/      # 路由
│   │   ├── services/    # 服务
│   │   └── types/      # TypeScript 类型定义
│   └── package.json
│
└── README.md
```

## API 接口

### 笔记相关
- `GET /api/notes` - 获取所有笔记
- `GET /api/notes/:id` - 获取单个笔记
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### 文件夹相关
- `GET /api/folders` - 获取所有文件夹
- `GET /api/folders/tree` - 获取文件夹树
- `GET /api/folders/:id` - 获取单个文件夹
- `POST /api/folders` - 创建文件夹
- `PUT /api/folders/:id` - 更新文件夹
- `DELETE /api/folders/:id` - 删除文件夹
- `GET /api/folders/:id/notes` - 获取文件夹下的笔记

### AI 相关
- `POST /api/ai/assist` - AI 辅助写作

### 搜索相关
- `GET /api/search` - 搜索笔记

## 快捷键

- `Cmd+Shift+F` - 切换沉浸式写作模式
- `Cmd+K` - 打开搜索

## 开发计划

- [ ] 用户认证和授权
- [ ] 多用户协作
- [ ] 云端同步
- [ ] 移动端适配
- [ ] 更多 AI 功能
- [ ] 笔记模板
- [ ] 数据备份和恢复

## License

MIT
