# Cloudflare 部署文档

本文档说明如何将 AI Note 项目部署到 Cloudflare。

## 部署方案概述

AI Note 项目包含前端（Next.js）和后端（Node.js + Express + SQLite），部署到 Cloudflare 需要以下组件：

- **前端**：Cloudflare Pages
- **后端**：Cloudflare Workers
- **数据库**：Cloudflare D1 (SQLite) 或 Neon (PostgreSQL)

## 部署架构

```
┌─────────────────┐
│ Cloudflare Pages │ (前端 - Next.js)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloudflare Workers│ (后端 API)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloudflare D1   │ (数据库 - SQLite)
└─────────────────┘
```

## 前端部署（Cloudflare Pages）

### 前置条件

1. Cloudflare 账号
2. wrangler CLI 工具

```bash
npm install -g wrangler
```

### 配置 Next.js

#### 1. 安装依赖

```bash
cd client
npm install @cloudflare/next-on-pages
```

#### 2. 创建 wrangler.toml

在 `client` 目录创建 `wrangler.toml`：

```toml
name = "ai-note-client"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[env.production]
NEXT_PUBLIC_API_URL = "https://ai-note-api.your-subdomain.workers.dev"
```

#### 3. 更新 next.config.mjs

创建或更新 `client/next.config.mjs`：

```javascript
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// Next.js 在开发模式下默认不支持 Edge Runtime，需要覆盖
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
```

#### 4. 部署到 Cloudflare Pages

**方法一：通过 GitHub 自动部署**

1. 将代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 选择 Workers & Pages
4. 点击 Create Application
5. 选择 Pages
6. 选择 Connect to Git
7. 选择 GitHub 仓库
8. 配置构建设置：
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.vercel/output/static`
9. 点击 Save and Deploy

**方法二：使用 wrangler 手动部署**

```bash
cd client

# 构建项目
npm run build

# 部署到 Pages
wrangler pages deploy .vercel/output/static --project-name=ai-note-client
```

## 后端部署（Cloudflare Workers）

### 方案选择

由于 Cloudflare Workers 不直接支持 Express，有以下方案：

#### 方案 1：使用 Hono（推荐）

Hono 是专为 Cloudflare Workers 设计的轻量级框架。

**优点：**
- 原生支持 Cloudflare Workers
- 性能优秀
- API 类似 Express

**缺点：**
- 需要重写后端代码

#### 方案 2：使用 @fastify/adapter-vercel

**优点：**
- 可以保留部分现有代码

**缺点：**
- 需要大量修改
- 不完全支持 Express 中间件

#### 方案 3：使用 Cloudflare Workers + Express 兼容层

使用 `itty-router` 或类似库。

**推荐使用方案 1：Hono**

### 使用 Hono 重构后端

#### 1. 安装依赖

```bash
cd server
npm uninstall express cors better-sqlite3
npm install hono @hono/zod-validator @cloudflare/workers-types wrangler
```

#### 2. 创建 wrangler.toml

在 `server` 目录创建 `wrangler.toml`：

```toml
name = "ai-note-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
AZURE_API_VERSION = "2024-05-01-preview"
AZURE_DEPLOYMENT_NAME = "Gpt-4o"

[[d1_databases]]
binding = "DB"
database_name = "ai-note-db"
database_id = "<your-database-id>"
```

#### 3. 创建新的入口文件

创建 `server/src/index.ts`：

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { getBinding } from 'hono/cloudflare-workers'
import notesRouter from './routes/notes'
import foldersRouter from './routes/folders'
import aiRouter from './routes/ai'
import searchRouter from './routes/search'
import exportRouter from './routes/export'

type Env = {
  DB: D1Database
  AZURE_OPENAI_KEY: string
  AZURE_OPENAI_ENDPOINT: string
  AZURE_API_VERSION: string
  AZURE_DEPLOYMENT_NAME: string
}

const app = new Hono<{ Bindings: Env }>()

// 中间件
app.use('*', cors())
app.use('*', logger())

// 路由
app.route('/api/notes', notesRouter)
app.route('/api/folders', foldersRouter)
app.route('/api/ai', aiRouter)
app.route('/api/search', searchRouter)
app.route('/api/export', exportRouter)

// 健康检查
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

export default app
```

#### 4. 更新数据库代码

创建 `server/src/db/database.ts`：

```typescript
import { D1Database } from '@cloudflare/workers-types'

let db: D1Database | null = null

export const initDatabase = (d1: D1Database) => {
  db = d1
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      folder_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      suggestion_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
    CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at);
    CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at);
    CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
    CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);
  `)

  console.log('Database initialized successfully')
}

export const getDatabase = (): D1Database => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}
```

#### 5. 更新控制器以使用 D1

所有控制器需要更新以使用 D1 API。示例：

```typescript
// server/src/controllers/notes.ts
import { Context } from 'hono'
import { getDatabase } from '../db/database'

export const getAllNotes = async (c: Context) => {
  const db = getDatabase()
  const { folder_id } = c.req.query()

  let query = 'SELECT * FROM notes ORDER BY updated_at DESC'
  const params: any[] = []

  if (folder_id) {
    query += ' WHERE folder_id = ?'
    params.push(folder_id)
  }

  const notes = await db.prepare(query).bind(...params).all()
  return c.json(notes.results)
}
```

#### 6. 部署到 Cloudflare Workers

```bash
cd server

# 首先创建 D1 数据库
wrangler d1 create ai-note-db

# 记录返回的 database_id 并更新 wrangler.toml

# 部署
wrangler deploy
```

## 环境变量配置

### Cloudflare Workers

```bash
# 设置环境变量
wrangler secret put AZURE_OPENAI_KEY
wrangler secret put AZURE_OPENAI_ENDPOINT
```

### Cloudflare Pages

在 Cloudflare Dashboard 中设置：
- Project Settings > Environment variables
- 添加：`NEXT_PUBLIC_API_URL` = `https://ai-note-api.your-subdomain.workers.dev`

## 数据库迁移

### 创建 D1 数据库

```bash
wrangler d1 create ai-note-db
```

### 执行 SQL

```bash
# 执行数据库初始化
wrangler d1 execute ai-note-db --remote --file=./schema.sql
```

### 数据备份

```bash
# 导出数据
wrangler d1 export ai-note-db --remote --output=backup.json

# 导入数据
wrangler d1 import ai-note-db --remote --file=backup.json
```

## 域名配置

### 前端域名

1. 进入 Cloudflare Dashboard
2. Workers & Pages > ai-note-client
3. Custom domains
4. 添加自定义域名

### 后端域名

1. 进入 Cloudflare Dashboard
2. Workers & Pages > ai-note-api
3. Settings > Triggers > Custom Domains
4. 添加自定义域名

## 监控和日志

### 查看日志

```bash
# Workers 日志
wrangler tail ai-note-api

# Pages 日志
wrangler pages deployment tail --project-name=ai-note-client
```

### Analytics

在 Cloudflare Dashboard 中查看：
- Workers Analytics
- Pages Analytics
- D1 Analytics

## 性能优化

### Cloudflare 特性

1. **缓存策略**
   - 配置 Cache--Control 头
   - 使用 Cloudflare 缓存

2. **边缘计算**
   - 利用 Cloudflare 边缘网络
   - 减少延迟

3. **图片优化**
   - 使用 Cloudflare Images

## 故障排查

### 常见问题

**Q: Workers 部署失败**
- 检查 wrangler.toml 配置
- 检查依赖是否正确安装
- 查看错误日志

**Q: D1 数据库连接失败**
- 确保 D1 数据库已创建
- 检查 wrangler.toml 中的 database_id
- 确保绑定正确配置

**Q: CORS 错误**
- 检查 cors() 中间件配置
- 确保前端 URL 在允许列表中

**Q: 环境变量未加载**
- 使用 wrangler secret 设置敏感变量
- 检查 wrangler.toml 中的 vars 配置

## 成本估算

### Cloudflare Pages
- 免费：500 构建/月，无限带宽
- 付费：$20/月起（无限构建）

### Cloudflare Workers
- 免费：100,000 请求/天
- 付费：$5/月起（1000 万请求/月）

### Cloudflare D1
- 免费：5 GB 存储，2.5 百行读取/天
- 付费：$0.50/百万行读取

**总计：免费套餐足够个人和小团队使用**

## 完整部署脚本

```bash
#!/bin/bash

echo "开始部署到 Cloudflare..."

# 1. 部署后端
cd server
echo "部署后端到 Workers..."
wrangler deploy
echo "后端部署完成！"

# 2. 部署前端
cd ../client
echo "部署前端到 Pages..."
npm run build
wrangler pages deploy .vercel/output/static --project-name=ai-note-client
echo "前端部署完成！"

# 3. 验证部署
echo "验证部署..."
curl -f https://ai-note-api.your-subdomain.workers.dev/health || echo "后端部署失败"
curl -f https://ai-note-client.pages.dev || echo "前端部署失败"

echo "部署完成！"
```

## 注意事项

1. **Express 不兼容**
   - Cloudflare Workers 不支持 Express
   - 需要使用 Hono 或类似框架

2. **SQLite 需要适配**
   - 不能使用 better-sqlite3
   - 必须使用 Cloudflare D1

3. **环境变量限制**
   - 不能使用 .env 文件
   - 必须使用 wrangler secret 或 vars

4. **构建时间限制**
   - Cloudflare Pages 构建时间有限制
   - 确保构建快速完成

5. **热重载**
   - 开发时需要使用 wrangler dev
   - 不能直接运行 npm run dev

## 参考资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Hono 框架](https://hono.dev/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)

## 后续步骤

1. 选择部署方案（推荐使用 Hono）
2. 重构后端代码以适配 Workers
3. 配置环境变量和 D1 数据库
4. 测试所有功能
5. 执行部署
6. 配置自定义域名
7. 设置监控和告警

---

**注意**：由于后端需要大量重构，建议先在本地测试 Cloudflare Workers 版本，确保功能正常后再部署。
