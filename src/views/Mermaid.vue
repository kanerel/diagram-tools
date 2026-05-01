<template>
  <div class="page">
    <header class="header">
      <h1><span>Mermaid</span> Preview</h1>
      <p>输入 Mermaid 代码，实时预览并导出图表</p>
    </header>
    <div class="main-grid" :class="{ stretched: !svgOutput }">
      <div class="card">
        <div class="card-title">Mermaid 输入</div>
        <textarea class="code-input" v-model="code" placeholder="graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
    C --> D" spellcheck="false"></textarea>
        <div class="btn-row">
          <button class="btn-primary" @click="render">生成图表</button>
          <button class="btn-ghost" @click="clear">清空</button>
        </div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </div>
      <div class="card preview-card" :class="{ 'has-content': !!svgOutput }">
        <div class="preview-header">
          <div class="card-title" style="margin-bottom:0">预览</div>
        </div>
        <div class="preview-placeholder" v-if="!svgOutput">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>输入代码后点击生成</p>
        </div>
        <div class="graph-container" v-show="svgOutput" ref="graphRef" v-html="svgOutput" @wheel.prevent="onWheel"></div>
        <div class="export-row" :class="{ visible: !!svgOutput }">
          <button class="btn-export" @click="downloadSVG">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            下载 SVG
          </button>
          <button class="btn-export" @click="downloadPNG">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            下载 PNG
          </button>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>
<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import Toast from '../components/Toast.vue'
import mermaid from 'mermaid'
import { toPng } from 'html-to-image'

mermaid.initialize({ startOnLoad: false, theme: 'neutral' })

const code = ref('')
const svgOutput = ref('')
const errorMsg = ref('')
const graphRef = ref(null)
const toastRef = ref(null)

// Pan & zoom state
let _panX = 0, _panY = 0, _zoom = 1
let _dragging = false, _dragStartX = 0, _dragStartY = 0, _dragStartPanX = 0, _dragStartPanY = 0
let _listenersAttached = false

function applyTransform() {
  const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
  if (!svg) return
  svg.style.transform = `translate(${_panX}px, ${_panY}px) scale(${_zoom})`
  svg.style.transformOrigin = 'center center'
}

function onWheel(e) {
  const factor = e.deltaY > 0 ? 0.9 : 1.1
  _zoom = Math.max(0.2, Math.min(5, _zoom * factor))
  applyTransform()
}

function onMouseDown(e) {
  if (e.button !== 0) return
  _dragging = true
  _dragStartX = e.clientX
  _dragStartY = e.clientY
  _dragStartPanX = _panX
  _dragStartPanY = _panY
  e.preventDefault()
}

function onMouseMove(e) {
  if (!_dragging) return
  _panX = _dragStartPanX + (e.clientX - _dragStartX)
  _panY = _dragStartPanY + (e.clientY - _dragStartY)
  applyTransform()
}

function onMouseUp() {
  _dragging = false
}

function attachListeners() {
  if (_listenersAttached || !graphRef.value) return
  _listenersAttached = true
  graphRef.value.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

onBeforeUnmount(() => {
  if (graphRef.value) {
    graphRef.value.removeEventListener('mousedown', onMouseDown)
  }
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})

async function render() {
  errorMsg.value = ''
  if (!code.value.trim()) {
    errorMsg.value = '请输入 Mermaid 代码'
    return
  }
  try {
    const id = 'mermaid-' + Date.now()
    const { svg } = await mermaid.render(id, code.value.trim())
    svgOutput.value = svg
    _panX = 0; _panY = 0; _zoom = 1
    nextTick(() => attachListeners())
    toastRef.value?.show('图表生成成功', 'success')
  } catch (e) {
    errorMsg.value = '语法错误: ' + (e.message || '请检查 Mermaid 代码格式')
    svgOutput.value = ''
  }
}

function clear() {
  code.value = ''
  svgOutput.value = ''
  errorMsg.value = ''
}

function downloadSVG() {
  if (!svgOutput.value) return
  const blob = new Blob([svgOutput.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mermaid-diagram.svg'
  a.click()
  URL.revokeObjectURL(url)
  toastRef.value?.show('已下载 SVG', 'success')
}

async function downloadPNG() {
  if (!svgOutput.value || !graphRef.value) return
  const svgEl = graphRef.value.querySelector('svg')
  if (!svgEl) return

  // Clone and inject black & white styles directly into SVG string
  const clone = svgEl.cloneNode(true)
  clone.style.transform = ''
  clone.style.maxWidth = 'none'

  // Set explicit dimensions from viewBox or getBBox
  const vb = svgEl.viewBox.baseVal
  const bbox = svgEl.getBBox()
  const w = vb.width || bbox.width || 800
  const h = vb.height || bbox.height || 600
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)

  // Inject <style> for black & white
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = `rect,polygon,circle,ellipse{fill:#fff!important;stroke:#000!important}path{stroke:#000!important}.node rect,.node polygon,.node circle{fill:#fff!important;stroke:#000!important}.cluster rect{fill:#f5f5f5!important;stroke:#000!important}marker path,marker polygon{fill:#000!important;stroke:#000!important}text,.label,.edgeLabel,.nodeLabel,.classLabel{fill:#000!important;stroke:none!important}.edgePath .path,.flowchart-link{stroke:#000!important;fill:none!important}.actor{fill:#fff!important;stroke:#000!important}text.actor>tspan{fill:#000!important}.messageLine0,.messageLine1{stroke:#000!important}.loopLine,.loopLiner{stroke:#000!important;fill:none!important}.sequenceNumber{fill:#fff!important;stroke:#000!important}#arrowhead path{fill:#000!important;stroke:#000!important}.entityBox{fill:#fff!important;stroke:#000!important}.relationshipLine{stroke:#000!important}.relationshipLabelBox{fill:#fff!important;stroke:#000!important}.attributeBoxEven,.attributeBoxOdd{fill:#fff!important;stroke:#000!important}`
  clone.insertBefore(styleEl, clone.firstChild)

  // Serialize to string with xmlns, use data URL for faster loading
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const svgStr = new XMLSerializer().serializeToString(clone)
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))

  const img = new Image()
  img.onload = () => {
    try {
      const scale = 3
      const canvas = document.createElement('canvas')
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(pngBlob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(pngBlob)
        a.download = 'mermaid-diagram.png'
        a.click()
        URL.revokeObjectURL(a.href)
        toastRef.value?.show('已下载 PNG', 'success')
      }, 'image/png')
    } catch (e) {
      // Canvas tainted by foreignObject, fallback to html-to-image
      downloadPngFallback(svgEl)
    }
  }
  img.onerror = () => {
    toastRef.value?.show('PNG 导出失败', 'error')
  }
  img.src = dataUrl
}

// Fallback: use html-to-image when SVG contains foreignObject (e.g. class diagrams)
async function downloadPngFallback(svgEl) {
  const origTransform = svgEl.style.transform || ''
  svgEl.style.transform = ''
  try {
    const dataUrl = await toPng(graphRef.value, {
      backgroundColor: '#ffffff',
      pixelRatio: 3,
      cacheBust: true
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'mermaid-diagram.png'
    a.click()
    toastRef.value?.show('已下载 PNG', 'success')
  } catch (e) {
    toastRef.value?.show('PNG 导出失败', 'error')
  } finally {
    svgEl.style.transform = origTransform
  }
}
</script>
<style scoped>
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
.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.main-grid.stretched { align-items: stretch; }
@media (max-width: 960px) {
  .main-grid { grid-template-columns: 1fr; }
  .page { padding: 20px; }
}
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }
.code-input { width: 100%; min-height: 380px; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 18px; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.7; resize: vertical; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.code-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-dim); }
.code-input::placeholder { color: var(--text-muted); }
.btn-row { display: flex; gap: 12px; margin-top: 16px; }
.btn-primary { flex: 1; padding: 12px 24px; border: none; border-radius: var(--radius); background: var(--accent); color: #0f1117; font-family: 'Noto Sans SC', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(232,168,73,0.3); }
.btn-ghost { flex: 1; padding: 12px 24px; border: 1px solid var(--border); border-radius: var(--radius); background: transparent; color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-ghost:hover { border-color: var(--text-muted); color: var(--text-primary); }
.error-msg { margin-top: 12px; padding: 10px 14px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); border-radius: var(--radius); color: var(--error); font-size: 0.85rem; }
.preview-card { display: flex; flex-direction: column; min-height: 380px; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.preview-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 16px; min-height: 200px; }
.preview-placeholder svg { opacity: 0.3; }
.preview-placeholder p { font-size: 0.9rem; }
.graph-container { background: #ffffff; border-radius: var(--radius); overflow: hidden; position: relative; flex: 1; min-height: 200px; display: flex; align-items: center; justify-content: center; padding: 20px; cursor: grab; }
.graph-container:active { cursor: grabbing; }
.graph-container :deep(svg) { max-width: 100%; height: auto; }
/* Force black & white for ALL mermaid diagram types */
.graph-container :deep(svg) { max-width: 100%; height: auto; }
.graph-container :deep(svg *) { fill: none !important; stroke: #000000 !important; color: #000000 !important; }
.graph-container :deep(svg rect),
.graph-container :deep(svg polygon),
.graph-container :deep(svg circle),
.graph-container :deep(svg ellipse),
.graph-container :deep(svg path) { fill: #ffffff !important; stroke: #000000 !important; }
.graph-container :deep(svg .node rect),
.graph-container :deep(svg .node polygon),
.graph-container :deep(svg .node circle) { fill: #ffffff !important; stroke: #000000 !important; }
.graph-container :deep(svg .cluster rect) { fill: #f5f5f5 !important; stroke: #000000 !important; }
.graph-container :deep(svg marker path),
.graph-container :deep(svg marker polygon) { fill: #000000 !important; stroke: #000000 !important; }
.graph-container :deep(svg text),
.graph-container :deep(svg .label),
.graph-container :deep(svg .edgeLabel),
.graph-container :deep(svg .nodeLabel),
.graph-container :deep(svg .classLabel) { fill: #000000 !important; color: #000000 !important; stroke: none !important; }
.graph-container :deep(svg .edgePath .path),
.graph-container :deep(svg .flowchart-link) { stroke: #000000 !important; fill: none !important; }
.graph-container :deep(svg .actor) { fill: #ffffff !important; stroke: #000000 !important; }
.graph-container :deep(svg text.actor > tspan) { fill: #000000 !important; }
.graph-container :deep(svg .messageLine0),
.graph-container :deep(svg .messageLine1) { stroke: #000000 !important; }
.graph-container :deep(svg .loopLine),
.graph-container :deep(svg .loopLiner) { stroke: #000000 !important; fill: none !important; }
.graph-container :deep(svg .sequenceNumber) { fill: #ffffff !important; stroke: #000000 !important; }
.graph-container :deep(svg #arrowhead path) { fill: #000000 !important; stroke: #000000 !important; }
.graph-container :deep(svg .entityBox) { fill: #ffffff !important; stroke: #000000 !important; }
.graph-container :deep(svg .relationshipLine) { stroke: #000000 !important; }
.graph-container :deep(svg .relationshipLabelBox) { fill: #ffffff !important; stroke: #000000 !important; }
.graph-container :deep(svg .attributeBoxEven),
.graph-container :deep(svg .attributeBoxOdd) { fill: #ffffff !important; stroke: #000000 !important; }
.export-row { display: none; gap: 10px; margin-top: 16px; }
.export-row.visible { display: flex; }
.btn-export { flex: 1; padding: 11px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-input); color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-export:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
</style>
