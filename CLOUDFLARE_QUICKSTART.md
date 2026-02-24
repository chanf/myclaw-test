# Cloudflare 部署快速指南

本文档提供将 AI Note 项目部署到 Cloudflare 的快速步骤。

## 快速部署（自动脚本）

### 前置条件

1. Cloudflare 账号
2. 已安装 Node.js
3. 已配置 GitHub 仓库

### 一键部署步骤

```bash
# 1. 克隆仓库
git clone git@github.com:chanf/myclaw-test.git
cd myclaw-test

# 2. 安装 wrangler
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 运行部署脚本
./deploy-cloudflare.sh
```

脚本会自动：
- ✅ 检查 D1 数据库并创建（如果不存在）
- ✅ 初始化数据库表
- ✅ 部署后端到 Workers
- ✅ 部署前端到 Pages
- ✅ 验证部署状态

## 手动部署

### 1. 配置 Cloudflare

登录 [Cloudflare Dashboard](https://dash.cloudflare.com) 并确保已登录：

```bash
wrangler login
```

### 2. 创建 D1 数据库

```bash
wrangler d1 create ai-note-db
```

记录返回的 `database_id`，并更新 `server/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "ai-note-db"
database_id = "<replace-with-database-id>"
```

### 3. 初始化数据库

```bash
wrangler d1 execute ai-note-db --remote --command="
CREATE TABLE IF NOT EXISTS folders (...);
CREATE TABLE IF NOT EXISTS notes (...);
CREATE TABLE IF NOT EXISTS tags (...);
CREATE TABLE IF NOT EXISTS note_tags (...);
CREATE TABLE IF NOT EXISTS ai_suggestions (...);
"
```

（完整 SQL 见 [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)）

### 4. 设置环境变量

```bash
# 设置 Azure OpenAI 密钥
wrangler secret put AZURE_OPENAI_KEY
wrangler secret put AZURE_OPENAI_ENDPOINT
```

### 5. 部署前端

```bash
cd client

# 设置 API URL（替换为你的 Workers URL）
export NEXT_PUBLIC_API_URL=https://ai-note-api.workers.dev/api

# 构建
npm run build

# 部署
wrangler pages deploy .vercel/output/static --project-name=ai-note-client
```

### 6. 配置 Pages 环境变量

在 Cloudflare Dashboard：
1. 进入 Workers & Pages > ai-note-client
2. Settings > Environment variables
3. 添加：`NEXT_PUBLIC_API_URL` = `https://ai-note-api.workers.dev/api`

## ⚠️ 重要提示

### 后端代码需要重构

当前后端使用 Express，**Cloudflare Workers 不支持 Express**。需要：

1. 安装 Hono 框架：
   ```bash
   cd server
   npm uninstall express cors better-sqlite3
   npm install hono @cloudflare/workers-types
   ```

2. 重写所有控制器以使用 D1 API

3. 使用 Hono 路由系统替换 Express 路由

详见完整文档：[CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)

## 部署后的 URL

部署成功后，你会得到：

- **前端**：`https://ai-note-client.pages.dev`（或自定义域名）
- **后端**：`https://ai-note-api.workers.dev`（或自定义域名）
- **数据库**：Cloudflare D1 (ai-note-db)

## 验证部署

```bash
# 测试后端健康检查
curl https://ai-note-api.workers.dev/health

# 测试前端访问
curl https://ai-note-client.pages.dev
```

## 配置自定义域名

### 前端域名

1. Cloudflare Dashboard > Workers & Pages > ai-note-client
2. Custom domains > Set up a custom domain
3. 添加你的域名

### 后端域名

1. Cloudflare Dashboard > Workers & Pages > ai-note-api
2. Settings > Triggers > Custom Domains
3. 添加你的域名

## 查看日志

```bash
# Workers 日志
wrangler tail ai-note-api

# Pages 日志
wrangler pages deployment tail --project-name=ai-note-client
```

## 成本

Cloudflare 免费套餐：

- ✅ 100,000 Workers 请求/天
- ✅ 500 Pages 构建/月
- ✅ 5 GB D1 存储
- ✅ 2.5 百行 D1 读取/天
- ✅ 无限带宽

**免费套餐足够个人和小团队使用！**

## 故障排查

### 问题：部署失败

```bash
# 查看详细错误
wrangler deploy --log-level=debug
```

### 问题：数据库连接失败

- 确保 D1 数据库已创建
- 检查 `wrangler.toml` 中的 `database_id`
- 确保 `[[d1_databases]]` 配置正确

### 问题：CORS 错误

确保 Workers 正确配置了 CORS：

```typescript
app.use('*', cors({
  origin: '*',
  credentials: true
}))
```

### 问题：环境变量未加载

- 使用 `wrangler secret` 设置敏感变量
- 检查 `wrangler.toml` 中的 `[vars]` 配置
- 重新部署以应用更改

## 需要帮助？

- 📖 [完整文档](CLOUDFLARE_DEPLOYMENT.md)
- 📖 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- 📖 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 📖 [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)

---

**注意**：由于后端需要从 Express 重构为 Hono，建议先在本地测试 Cloudflare Workers 版本，确保功能正常后再部署。
