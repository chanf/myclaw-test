# 快速开始指南

欢迎使用 AI Note！本指南将帮助您在 5 分钟内开始使用。

## 第一步：安装依赖

确保您已安装 Node.js 18 或更高版本。

```bash
# 克隆仓库
git clone git@github.com:chanf/myclaw-test.git
cd myclaw-test

# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

## 第二步：配置环境变量

### 服务端配置

在 `server` 目录下创建 `.env` 文件：

```env
PORT=3001
DB_PATH=./data/notes.db
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_API_VERSION=2024-05-01-preview
AZURE_DEPLOYMENT_NAME=Gpt-4o
```

**注意**：将 `your_azure_openai_key` 和 `https://your-resource.openai.azure.com/` 替换为您自己的 Azure OpenAI 密钥和端点。

### 客户端配置

在 `client` 目录下创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 第三步：启动应用

### 启动服务端

```bash
cd server
npm run dev
```

服务端将在 `http://localhost:3001` 启动。

### 启动客户端（新终端窗口）

```bash
cd client
npm run dev
```

客户端将在 `http://localhost:3000` 启动。

## 第四步：开始使用

1. 打开浏览器访问 `http://localhost:3000`
2. 点击左侧边栏的"新建笔记"按钮
3. 开始写作！支持 Markdown 格式

## 核心功能快速上手

### 创建笔记

1. 点击"新建笔记"按钮
2. 输入标题和内容
3. 内容会自动保存

### 创建文件夹

1. 点击"新建文件夹"按钮
2. 输入文件夹名称
3. 文件夹会显示在左侧边栏

### 使用 AI 助手

1. 打开一个笔记
2. 点击右下角的 AI 按钮
3. 选择 AI 操作类型：
   - 续写：自动继续写作
   - 优化：改进文本质量
   - 总结：生成内容摘要
   - 翻译：翻译成其他语言
   - 改写：改变写作风格
4. 点击"开始生成"
5. AI 会生成内容，您可以"应用到笔记"

### 沉浸式写作

1. 点击左侧边栏的"沉浸模式"按钮（或按 Cmd+Shift+F）
2. 所有界面元素将隐藏，只保留编辑器
3. 按 ESC 键退出沉浸模式

### 搜索笔记

1. 按 Cmd+K 打开搜索框
2. 输入关键词搜索
3. 搜索结果会实时显示

### 导出笔记

1. 打开一个笔记
2. 点击编辑器右上角的导出按钮
3. 选择导出格式（Markdown 或 JSON）
4. 文件会自动下载

### 夜间模式

1. 点击顶部导航栏的月亮/太阳图标
2. 切换夜间/日间模式

## Markdown 快速参考

### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 文本格式
```markdown
**粗体**
*斜体*
~~删除线~~
`行内代码`
```

### 列表
```markdown
- 无序列表项
  - 子项
1. 有序列表项
   1. 子项
```

### 代码块
```markdown
```javascript
const x = 1;
console.log(x);
```
```

### 链接和图片
```markdown
[链接文字](https://example.com)

![图片描述](image.jpg)
```

### 引用
```markdown
> 这是一段引用
```

### 分隔线
```markdown
---
```

### 表格
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
```

## 常见问题

### Q: 如何修改 AI 模型？
A: 在 `server/.env` 文件中修改 `AZURE_DEPLOYMENT_NAME` 变量。

### Q: 数据存储在哪里？
A: 数据存储在 SQLite 数据库文件中，默认位置是 `server/data/notes.db`。

### Q: 如何备份数据？
A: 直接复制 `server/data/notes.db` 文件即可。

### Q: 支持多用户吗？
A: 当前版本是单用户版本，不支持多用户功能。

### Q: 能离线使用吗？
A: AI 功能需要联网，其他功能可以离线使用。

### Q: 如何更新应用？
A: 运行 `git pull origin main` 拉取最新代码，然后重新安装依赖和构建。

## 下一步

- 查看 [完整文档](README.md)
- 了解 [部署指南](DEPLOYMENT.md)
- 探索更多功能

## 获取帮助

如果您遇到问题：
1. 查看本文档的常见问题部分
2. 检查 [GitHub Issues](https://github.com/chanf/myclaw-test/issues)
3. 提交新的 Issue

## 快捷键速查

| 快捷键 | 功能 |
|--------|------|
| Cmd+Shift+F | 切换沉浸模式 |
| Cmd+K | 打开搜索 |
| ESC | 退出沉浸模式 |

享受写作！✨
