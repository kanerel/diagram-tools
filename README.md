# Diagram Tools

一款基于 Vue 3 的在线图表绘制工具集，支持多种 UML 及软件工程图表的编辑、预览与导出。

## 功能特性

### SQL to ER
- 输入 SQL DDL 语句，自动解析并生成 ER 图
- 实时预览，支持拖拽调整实体位置
- 导出 SVG / PNG / Draw.io 格式

### Mermaid
- 支持 Mermaid 全部图表类型（流程图、时序图、类图、ER 图、甘特图等）
- 黑白主题渲染，适合论文及文档使用
- 支持鼠标拖拽平移与滚轮缩放
- 导出 SVG / PNG

### Use Case（用例图）
- 可视化编辑 UML 用例图
- 支持添加多个参与者与用例
- 系统边界框自动跟随用例位置调整
- 支持 `<<include>>` / `<<extend>>` 关系连线
- 节点自由拖拽，连线实时更新
- 导出 SVG / PNG / Draw.io 格式

### System Module（系统功能模块图）
- 树形结构编辑系统功能模块
- 支持多级嵌套（系统 → 模块 → 子模块 → 功能）
- 功能节点竖排文字显示
- 自动树形布局，折线连接
- 节点拖拽时子节点同步移动
- 导出 SVG / PNG

## 技术栈

| 技术 | 说明 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | 路由管理 |
| [Mermaid](https://mermaid.js.org/) | 图表渲染引擎 |
| [html-to-image](https://github.com/bubkoo/html-to-image) | DOM 转 PNG 导出 |

## 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/kanerel/diagram-tools.git
cd diagram-tools

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### Docker 部署

```bash
# 克隆仓库
git clone https://github.com/kanerel/diagram-tools.git
cd diagram-tools

# 使用 docker-compose 一键启动
docker compose up -d

# 访问 http://localhost:8080
```

也可以手动构建和运行：

```bash
# 构建 Docker 镜像
docker build -t diagram-tools .

# 运行容器
docker run -d -p 8080:80 diagram-tools
```

## 导出格式

| 格式 | 说明 | 适用场景 |
|------|------|----------|
| SVG | 矢量图，无损缩放 | 文档编辑、网页嵌入 |
| PNG | 高清位图（3x 分辨率） | 论文插图、演示文稿 |
| Draw.io | 可在 Draw.io 中继续编辑 | 后续修改、团队协作 |

## License

MIT
