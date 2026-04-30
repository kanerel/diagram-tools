<!--
  PageTemplate.vue
  通用页面模板 - 左输入右预览的两列布局
  复用方式：复制此文件到 src/views/，修改标题、输入区、预览区内容即可
  
  使用说明：
  1. 复制文件并重命名（如 MyFeature.vue）
  2. 修改 header 中的标题和描述
  3. 在左侧 slot="input" 中放置输入组件
  4. 在右侧 slot="preview" 中放置预览组件
  5. 在 router/index.js 中添加路由
  6. 在 NavBar.vue 的 navRoutes 中添加导航链接
-->
<template>
  <div class="page">
    <header class="header">
      <h1>{{ title }} <span>{{ titleAccent }}</span></h1>
      <p>{{ description }}</p>
    </header>
    <div class="main-grid">
      <!-- 左侧：输入区 -->
      <div class="card">
        <slot name="input">
          <!-- 默认内容：文本输入 + 操作按钮 -->
          <div class="card-title">输入</div>
          <textarea
            class="code-input"
            v-model="inputValue"
            :placeholder="placeholder"
            spellcheck="false"
          ></textarea>
          <div class="btn-row">
            <button class="btn-primary" @click="$emit('generate', inputValue)">
              {{ generateText }}
            </button>
            <button class="btn-ghost" @click="handleClear">
              清空
            </button>
          </div>
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </slot>
      </div>

      <!-- 右侧：预览区 -->
      <div class="card preview-card" :class="{ 'has-content': hasContent }">
        <div class="preview-header">
          <div class="card-title" style="margin-bottom:0">预览</div>
        </div>
        <slot name="preview">
          <!-- 默认内容：占位提示 -->
          <div class="preview-placeholder" v-if="!hasContent">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p>{{ emptyText }}</p>
          </div>
          <div class="graph-container" v-show="hasContent" ref="graphRef">
            <slot name="graph"></slot>
          </div>
        </slot>
        <!-- 导出按钮行 -->
        <slot name="export">
          <div class="export-row" :class="{ visible: hasContent }">
            <button class="btn-export" @click="$emit('export-svg')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              下载 SVG
            </button>
            <button class="btn-export" @click="$emit('export-png')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              下载 PNG
            </button>
          </div>
        </slot>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Toast from '../components/Toast.vue'

// ============ 页面配置（修改这里来自定义页面） ============
const props = defineProps({
  title: { type: String, default: 'Feature' },
  titleAccent: { type: String, default: 'Name' },
  description: { type: String, default: '功能描述' },
  placeholder: { type: String, default: '在此输入内容...' },
  generateText: { type: String, default: '生成' },
  emptyText: { type: String, default: '在左侧输入内容后点击生成' },
  hasContent: { type: Boolean, default: false }
})

defineEmits(['generate', 'clear', 'export-svg', 'export-png'])

// ============ 内部状态 ============
const inputValue = ref('')
const errorMsg = ref('')
const graphRef = ref(null)
const toastRef = ref(null)

function handleClear() {
  inputValue.value = ''
  errorMsg.value = ''
}

// 暴露给父组件的方法
defineExpose({
  toastRef,
  graphRef,
  setError(msg) { errorMsg.value = msg },
  clearError() { errorMsg.value = '' }
})
</script>

<style scoped>
/* ============ 页面布局 ============ */
.page {
  max-width: 100%;
  margin: 0 auto;
  padding: 32px 15%;
}
.header {
  text-align: center;
  margin-bottom: 40px;
}
.header h1 {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.header h1 span {
  color: var(--accent);
}
.header p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 300;
}
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: stretch;
}
@media (max-width: 960px) {
  .main-grid { grid-template-columns: 1fr; }
  .page { padding: 20px; }
}

/* ============ 卡片 ============ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow);
}
.card-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  background: var(--accent);
  border-radius: 2px;
}

/* ============ 输入区 ============ */
.code-input {
  width: 100%;
  min-height: 380px;
  background: var(--bg-input);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.code-input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.code-input::placeholder {
  color: var(--text-muted);
}

/* ============ 按钮 ============ */
.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.btn-primary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: #0f1117;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232,168,73,0.3);
}
.btn-ghost {
  flex: 1;
  padding: 12px 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-secondary);
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ghost:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
}
.error-msg {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(248,113,113,0.1);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: var(--radius);
  color: var(--error);
  font-size: 0.85rem;
}

/* ============ 预览区 ============ */
.preview-card {
  display: flex;
  flex-direction: column;
  min-height: 380px;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.preview-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 16px;
  min-height: 200px;
}
.preview-placeholder svg {
  opacity: 0.3;
}
.preview-placeholder p {
  font-size: 0.9rem;
}
.graph-container {
  background: #ffffff;
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  flex: 1;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.graph-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* ============ 导出按钮 ============ */
.export-row {
  display: none;
  gap: 10px;
  margin-top: 16px;
}
.export-row.visible {
  display: flex;
}
.btn-export {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-input);
  color: var(--text-secondary);
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-export:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}
</style>
