# 🎨 Diagram Tools

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

一款基于 Vue 3 的在线图表绘制工具集，支持多种 UML 及软件工程图表的编辑、预览与导出，专为论文写作和软件开发场景设计。

## ✨ 核心特性

### 功能模块矩阵

| 模块 | 核心能力 | 导出格式 | 特色功能 |
|------|---------|---------|---------|
| **SQL to ER** | SQL DDL → ER 图 | SVG / PNG / Draw.io | 实时预览、拖拽布局 |
| **Mermaid** | 全类型 Mermaid 图表 | SVG / PNG | 黑白主题、拖拽缩放 |
| **Use Case** | UML 用例图编辑 | SVG / PNG / Draw.io | 参与者、系统边界、关系连线 |
| **System Module** | 系统功能模块图 | SVG / PNG | 多级嵌套、树形布局、子节点联动拖拽 |

### 技术亮点

| 特性 | 说明 |
|------|------|
| 🖱️ 自由拖拽 | 所有图表节点支持拖拽调整位置 |
| 📐 自动布局 | System Module 自动树形布局，折线连接 |
| 🎯 黑白渲染 | Mermaid 图表黑白主题，适合论文直接使用 |
| ⚡ 高清导出 | PNG 导出 3x 分辨率，SVG 矢量无损 |
| 🐳 Docker 部署 | 一键 Docker 部署，零配置上线 |

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| [Vue 3](https://vuejs.org/) | 3.5+ | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | 5.x | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | 4.x | 路由管理 |
| [Mermaid](https://mermaid.js.org/) | 11.x | 图表渲染引擎 |
| [Nginx](https://nginx.org/) | Alpine | 生产环境部署 |

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/kanerel/diagram-tools.git
cd diagram-tools

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build
```

### Docker 部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/kanerel/diagram-tools.git
cd diagram-tools

# 2. 一键启动
docker compose up -d

# 3. 访问 http://localhost:8080
```

手动构建：

```bash
docker build -t diagram-tools .
docker run -d -p 8080:80 diagram-tools
```

## 📄 导出格式

| 格式 | 说明 | 适用场景 |
|------|------|----------|
| SVG | 矢量图，无损缩放 | 文档编辑、网页嵌入 |
| PNG | 高清位图（3x 分辨率） | 论文插图、演示文稿 |
| Draw.io | 可在 Draw.io 中继续编辑 | 后续修改、团队协作 |

## ☕ 请喝咖啡
您的☕和⭐将助力项目持续更新：

<div align="center">
  <img src="./images/wechatpay.jpg" width="400px" alt="微信赞赏码"> 
  <img src="./images/alipay.jpg" width="400px" alt="支付宝收款码">
</div>

## 📈 Star 趋势

<a href="https://www.star-history.com/?type=date&repos=kanerel%2Fdiagram-tools">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=kanerel/diagram-tools&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=kanerel/diagram-tools&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=kanerel/diagram-tools&type=date&legend=top-left" />
 </picture>
</a>

## 🤝 参与贡献

欢迎通过 Issue 提交建议或 PR 贡献代码。

