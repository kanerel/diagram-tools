<template>
  <div class="home">
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">开源 · 免费 · 在线 · 亮暗主题</div>
        <h1 class="hero-title">
          <span class="title-accent">Diagram</span> Tools
        </h1>
        <p class="hero-desc">一站式图表绘制工具集，支持 SQL 转 ER 图、SQL 生成三线表、UML 用例图、系统功能模块图、流程图、Mermaid 图表的编辑、预览与导出。</p>
        <div class="hero-actions">
          <router-link to="/sql-to-er" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            开始使用
          </router-link>
          <a href="https://github.com/kanerel/diagram-tools" target="_blank" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </div>
    </div>

    <div class="features">
      <div class="features-header">
        <h2 class="section-title">功能模块</h2>
        <p class="section-desc">六大核心工具，覆盖软件工程常用图表需求</p>
      </div>
      <div class="features-grid">
        <router-link to="/sql-to-er" class="feature-card">
          <div class="card-icon" style="--card-color: #4ade80">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          </div>
          <h3>SQL to ER</h3>
          <p>输入 SQL DDL 语句，自动解析并生成 ER 图。支持拖拽调整布局，导出 SVG / PNG / Draw.io。</p>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </router-link>

        <router-link to="/sql-to-table" class="feature-card">
          <div class="card-icon" style="--card-color: #f472b6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </div>
          <h3>SQL to Table</h3>
          <p>输入 SQL DDL 语句，自动生成学术三线表。导出 PNG / Word / Excel，适合论文直接使用。</p>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </router-link>

        <router-link to="/use-case" class="feature-card">
          <div class="card-icon" style="--card-color: #60a5fa">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="12" y1="16" x2="8" y2="22"/><line x1="12" y1="16" x2="16" y2="22"/></svg>
          </div>
          <h3>Use Case</h3>
          <p>可视化编辑 UML 用例图，支持参与者、用例、系统边界及 include / extend 关系连线。</p>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </router-link>

        <router-link to="/system-module" class="feature-card">
          <div class="card-icon" style="--card-color: #c084fc">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </div>
          <h3>System Module</h3>
          <p>树形结构编辑系统功能模块，支持多级嵌套、自动布局、节点拖拽，导出 SVG / PNG。</p>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </router-link>

        <router-link to="/mermaid" class="feature-card">
          <div class="card-icon" style="--card-color: #e8a849">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <h3>Mermaid</h3>
          <p>支持 Mermaid 全部图表类型，黑白主题渲染，适合论文及文档使用。支持拖拽平移与缩放。</p>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </router-link>

        <router-link to="/flowchart" class="feature-card">
          <div class="card-icon" style="--card-color: #34d399">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><polyline points="9 11 12 8 15 11"/></svg>
          </div>
          <h3>FlowChart</h3>
          <p>可视化流程图编辑器，支持开始/结束、处理、判断、输入输出五种节点，连线标签，折线连接，拖拽布局与撤销重做。</p>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </router-link>
      </div>
    </div>

    <div class="tech-section">
      <h2 class="section-title">技术栈</h2>
      <div class="tech-tags">
        <span class="tech-tag">Vue 3</span>
        <span class="tech-tag">Vite</span>
        <span class="tech-tag">Vue Router</span>
        <span class="tech-tag">Mermaid.js</span>
        <span class="tech-tag">docx.js</span>
        <span class="tech-tag">SheetJS</span>
        <span class="tech-tag">SVG</span>
        <span class="tech-tag">Canvas</span>
      </div>
    </div>

    <footer class="home-footer">
      <p>Diagram Tools &copy; 2025 · Built with Vue 3</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.hero {
  position: relative;
  text-align: center;
  padding: 80px 0 60px;
}
.hero-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(232,168,73,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero-content {
  position: relative;
}
.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  letter-spacing: 2px;
}
.hero-title {
  font-size: 3.2rem;
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -1px;
}
.title-accent {
  color: var(--accent);
}
.hero-desc {
  font-size: 1.05rem;
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 auto 36px;
  line-height: 1.7;
}
.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--accent);
  color: #0f1117;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(232,168,73,0.3);
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  text-decoration: none;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--text-secondary);
  transform: translateY(-1px);
}

/* Features */
.features {
  padding: 40px 0 60px;
}
.features-header {
  text-align: center;
  margin-bottom: 40px;
}
.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 10px;
}
.section-desc {
  color: var(--text-secondary);
  font-size: 0.92rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.feature-card {
  position: relative;
  display: block;
  padding: 28px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all 0.25s;
  overflow: hidden;
}
.feature-card:hover {
  border-color: var(--card-color, var(--accent));
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
}
.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  color: var(--card-color, var(--accent));
  margin-bottom: 18px;
}
.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 10px;
}
.feature-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.65;
  padding-right: 20px;
}
.card-arrow {
  position: absolute;
  right: 20px;
  bottom: 24px;
  color: var(--text-muted);
  transition: all 0.25s;
}
.feature-card:hover .card-arrow {
  color: var(--card-color, var(--accent));
  transform: translateX(3px);
}

/* Tech */
.tech-section {
  text-align: center;
  padding: 40px 0 60px;
  border-top: 1px solid var(--border);
}
.tech-tags {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}
.tech-tag {
  padding: 6px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Footer */
.home-footer {
  text-align: center;
  padding: 30px 0;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .hero-title { font-size: 2.2rem; }
  .features-grid { grid-template-columns: 1fr; }
}
@media (max-width: 960px) and (min-width: 641px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
