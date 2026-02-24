#!/bin/bash

# AI Note Cloudflare 部署脚本 (Hono 版本)

set -e

echo "========================================"
echo "AI Note Cloudflare 部署脚本"
echo "========================================"
echo ""

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安装，正在安装..."
    npm install -g wrangler
fi

# 登录检查
echo "📋 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  未登录，请运行: wrangler login"
    exit 1
fi

echo "✅ 已登录到 Cloudflare"
echo ""

# 部署后端 (Cloudflare Workers)
echo "========================================"
echo "🚀 步骤 1/2: 部署后端到 Cloudflare Workers"
echo "========================================"

cd server

# 检查 D1 数据库是否存在
echo "📊 检查 D1 数据库..."
if ! wrangler d1 list | grep -q "ai-note-db"; then
    echo "⚠️  D1 数据库不存在，正在创建..."
    wrangler d1 create ai-note-db
    
    # 获取 database_id
    DB_ID=$(wrangler d1 list | grep "ai-note-db" | grep -oP 'database_id: \K\w+')
    
    echo "✅ D1 数据库创建成功"
    echo ""
    echo "⚠️  请将返回的 database_id 更新到 server/wrangler.toml"
    echo "   database_id = \"$DB_ID\""
    echo "⚠️  然后重新运行此脚本"
    exit 1
else
    echo "✅ D1 数据库已存在"
fi

# 初始化数据库表
echo "📊 初始化数据库表..."
if wrangler d1 execute ai-note-db --remote --command="
SELECT name FROM sqlite_master WHERE type='table' AND name='notes';
" | grep -q "notes"; then
    echo "✅ 数据库表已存在"
else
    echo "📊 创建数据库表..."
    wrangler d1 execute ai-note-db --remote --file=../server/schema.sql
    echo "✅ 数据库表初始化完成"
fi

# 部署 Workers
echo "🚀 部署 Workers..."
wrangler deploy
echo "✅ Workers 部署完成"
echo ""

# 获取 Workers URL
WORKERS_URL=$(wrangler deployments list --name=ai-note-api | head -n 1 | grep -oP 'https://[^ ]*\.workers\.dev')
echo "📍 Workers URL: $WORKERS_URL"
echo ""

# 更新前端配置
cd ../client

echo "🔧 设置 API URL: $WORKERS_URL/api"
export NEXT_PUBLIC_API_URL="$WORKERS_URL/api"

# 部署前端 (Cloudflare Pages)
echo "========================================"
echo "🚀 步骤 2/2: 部署前端到 Cloudflare Pages"
echo "========================================"

# 安装 @cloudflare/next-on-pages
if [ ! -d "node_modules/@cloudflare/next-on-pages" ]; then
    echo "📦 安装 @cloudflare/next-on-pages..."
    npm install @cloudflare/next-on-pages --save-dev
fi

# 构建项目
echo "🔨 构建前端项目..."
npm run build

# 部署到 Pages
echo "🚀 部署到 Pages..."
wrangler pages deploy .vercel/output/static --project-name=ai-note-client
echo "✅ Pages 部署完成"
echo ""

# 获取 Pages URL
PAGES_URL=$(wrangler pages deployment list --project-name=ai-note-client | head -n 1 | grep -oP 'https://[^ ]*\.pages\.dev')
echo "📍 Pages URL: $PAGES_URL"
echo ""

# 验证部署
echo "========================================"
echo "🧪 验证部署"
echo "========================================"

echo "测试后端健康检查..."
if curl -f -s "$WORKERS_URL/health" > /dev/null; then
    echo "✅ 后端健康检查通过"
else
    echo "❌ 后端健康检查失败"
fi

echo ""
echo "测试前端访问..."
if curl -f -s "$PAGES_URL" > /dev/null; then
    echo "✅ 前端可访问"
else
    echo "❌ 前端访问失败"
fi

echo ""
echo "========================================"
echo "🎉 部署完成！"
echo "========================================"
echo ""
echo "📍 前端 URL: $PAGES_URL"
echo "📍 后端 URL: $WORKERS_URL"
echo ""
echo "📋 后续步骤："
echo "   1. 访问前端 URL 查看应用"
echo "   2. 配置自定义域名（可选）"
echo "   3. 设置 Workers Secrets:"
echo "      wrangler secret put AZURE_OPENAI_KEY"
echo "      wrangler secret put AZURE_OPENAI_ENDPOINT"
echo "   4. 配置 Pages 环境变量:"
echo "      在 Cloudflare Dashboard > ai-note-client > Settings > Environment variables"
echo "      NEXT_PUBLIC_API_URL = $WORKERS_URL/api"
echo ""
echo "📚 查看文档："
echo "   - CLOUDFLARE_QUICKSTART.md"
echo "   - CLOUDFLARE_DEPLOYMENT.md"
echo ""
