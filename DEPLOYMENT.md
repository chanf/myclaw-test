# AI Note 部署文档

本文档提供 AI Note 应用的详细部署指南。

## 部署选项

### 选项 1: 本地部署

#### 前置条件
- Node.js 18 或更高版本
- npm 或 yarn
- Git

#### 部署步骤

1. 克隆仓库
```bash
git clone git@github.com:chanf/myclaw-test.git
cd myclaw-test
```

2. 安装依赖

服务端：
```bash
cd server
npm install
```

客户端：
```bash
cd client
npm install
```

3. 配置环境变量

创建服务端 `.env` 文件：
```env
PORT=3001
DB_PATH=./data/notes.db
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_API_VERSION=2024-05-01-preview
AZURE_DEPLOYMENT_NAME=Gpt-4o
```

创建客户端 `.env.local` 文件：
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. 启动服务

启动服务端（开发模式）：
```bash
cd server
npm run dev
```

启动服务端（生产模式）：
```bash
cd server
npm run build
npm start
```

启动客户端（开发模式）：
```bash
cd client
npm run dev
```

启动客户端（生产模式）：
```bash
cd client
npm run build
npm start
```

5. 访问应用

打开浏览器访问 `http://localhost:3000`

### 选项 2: Docker 部署

#### 创建 Dockerfile（服务端）

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### 创建 Dockerfile（客户端）

```dockerfile
# client/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - DB_PATH=/app/data/notes.db
      - AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_API_VERSION=${AZURE_API_VERSION}
      - AZURE_DEPLOYMENT_NAME=${AZURE_DEPLOYMENT_NAME}
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://server:3001/api
    depends_on:
      - server
    restart: unless-stopped

volumes:
  data:
```

#### 使用 Docker Compose 启动

```bash
# 创建环境变量文件
cat > .env << EOF
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_API_VERSION=2024-05-01-preview
AZURE_DEPLOYMENT_NAME=Gpt-4o
EOF

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 选项 3: Vercel + Railway 部署

#### 部署前端到 Vercel

1. 将代码推送到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 选择 GitHub 仓库
5. 配置环境变量：
   - `NEXT_PUBLIC_API_URL`：你的服务端 API URL
6. 点击 "Deploy"

#### 部署后端到 Railway

1. 登录 [Railway](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 GitHub 仓库
5. 配置环境变量：
   - `PORT`：3001
   - `AZURE_OPENAI_KEY`：你的 Azure OpenAI 密钥
   - `AZURE_OPENAI_ENDPOINT`：你的 Azure OpenAI 端点
   - `AZURE_API_VERSION`：API 版本
   - `AZURE_DEPLOYMENT_NAME`：部署名称
6. 点击 "Deploy"

## 环境变量说明

### 服务端环境变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `PORT` | 否 | 服务端端口 | 3001 |
| `DB_PATH` | 否 | 数据库文件路径 | ./data/notes.db |
| `AZURE_OPENAI_KEY` | 是 | Azure OpenAI 密钥 | your_api_key |
| `AZURE_OPENAI_ENDPOINT` | 是 | Azure OpenAI 端点 | https://resource.openai.azure.com/ |
| `AZURE_API_VERSION` | 是 | API 版本 | 2024-05-01-preview |
| `AZURE_DEPLOYMENT_NAME` | 是 | 部署名称 | Gpt-4o |

### 客户端环境变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `NEXT_PUBLIC_API_URL` | 是 | 服务端 API URL | http://localhost:3001/api |

## 数据备份

### 备份数据库

```bash
# 备份数据库文件
cp server/data/notes.db server/data/notes.db.backup.$(date +%Y%m%d)
```

### 恢复数据库

```bash
# 恢复数据库文件
cp server/data/notes.db.backup.20250223 server/data/notes.db
```

### 自动备份脚本

创建 `backup.sh`：
```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
cp server/data/notes.db $BACKUP_DIR/notes.db.$DATE

# 删除 30 天前的备份
find $BACKUP_DIR -name "notes.db.*" -mtime +30 -delete

echo "Backup completed: notes.db.$DATE"
```

使用 crontab 设置定时备份：
```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

## 故障排查

### 服务端无法启动

1. 检查端口是否被占用：
```bash
lsof -i :3001
```

2. 检查环境变量是否配置正确

3. 查看日志：
```bash
cd server
npm run dev
```

### 客户端无法连接服务端

1. 检查服务端是否正常运行：
```bash
curl http://localhost:3001/health
```

2. 检查环境变量 `NEXT_PUBLIC_API_URL` 是否正确

3. 检查防火墙设置

### AI 功能无法使用

1. 检查 Azure OpenAI 配置是否正确

2. 检查 API 密钥是否有效

3. 查看服务端日志获取错误信息

### 数据库错误

1. 检查数据库文件权限：
```bash
ls -la server/data/notes.db
```

2. 确保数据目录存在且有写入权限：
```bash
mkdir -p server/data
chmod 755 server/data
```

## 性能优化

### 服务端优化

1. 使用 PM2 管理进程：
```bash
npm install -g pm2
pm2 start dist/index.js --name ai-note-server
pm2 startup
pm2 save
```

2. 启用数据库 WAL 模式（已默认启用）

3. 定期清理数据库：
```sql
VACUUM;
```

### 客户端优化

1. 使用 Next.js 静态生成（SSG）

2. 启用图片优化

3. 使用 CDN 加速静态资源

## 安全建议

1. 使用环境变量存储敏感信息

2. 启用 HTTPS

3. 限制 API 访问频率

4. 定期更新依赖包

5. 使用强密码保护数据库

6. 启用 CORS 白名单

## 监控和日志

### 查看服务端日志

```bash
cd server
pm2 logs ai-note-server
```

### 查看客户端日志

```bash
cd client
pm2 logs ai-note-client
```

### 使用日志聚合服务

建议使用以下服务之一：
- Sentry
- LogRocket
- Datadog

## 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
cd server && npm install
cd ../client && npm install

# 重新构建
cd server && npm run build
cd ../client && npm run build

# 重启服务
pm2 restart all
```

### 数据库迁移

如果有数据库结构变更，需要创建迁移脚本：

```sql
-- 示例：添加新字段
ALTER TABLE notes ADD COLUMN summary TEXT;
```

## 支持

如有问题，请：
1. 查看本文档的故障排查部分
2. 检查 GitHub Issues
3. 提交新的 Issue 描述问题
