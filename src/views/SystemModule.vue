<template>
  <div class="page">
    <header class="header">
      <h1>System <span>Module</span></h1>
      <p>添加模块和功能，实时生成系统功能模块图</p>
    </header>
    <div class="main-grid">
      <!-- 左侧：编辑面板 -->
      <div class="card editor-card">
        <div class="editor-toolbar">
          <div class="card-title" style="margin-bottom:0">模块编辑器</div>
        </div>
        <!-- 系统名称 -->
        <div class="system-name-row">
          <span class="node-icon root-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </span>
          <input class="node-input" v-model="systemName" placeholder="系统名称" @input="onDataChange" />
        </div>
        <!-- 模块列表 -->
        <div class="tree" v-if="modules.length > 0">
          <div v-for="(mod, mi) in modules" :key="mod.id" class="tree-module">
            <div class="tree-node module-node">
              <span class="node-icon module-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </span>
              <input class="node-input" v-model="mod.name" placeholder="模块名称" @input="onDataChange" />
              <button class="btn-node-add" @click="addChild(mod, 'function')" title="添加功能">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="btn-node-add" @click="addChild(mod, 'module')" title="添加子模块">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
              <button class="btn-node-del" @click="removeModule(mi)" title="删除">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            <!-- 子节点 -->
            <div class="tree-children" v-if="mod.children && mod.children.length > 0">
              <div v-for="(child, ci) in mod.children" :key="child.id" class="tree-node child-node">
                <span class="node-icon" :class="child.type === 'function' ? 'func-icon' : 'submod-icon'">
                  <svg v-if="child.type === 'function'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </span>
                <input class="node-input" v-model="child.name" :placeholder="child.type === 'function' ? '功能名称' : '子模块名称'" @input="onDataChange" />
                <button v-if="child.type === 'module'" class="btn-node-add" @click="addChild(child, 'function')" title="添加功能">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button v-if="child.type === 'module'" class="btn-node-add" @click="addChild(child, 'module')" title="添加子模块">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </button>
                <button class="btn-node-del" @click="removeChild(mod, ci)" title="删除">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="editor-empty" v-else>
          <p>点击下方按钮添加模块</p>
        </div>
        <!-- 添加模块按钮 -->
        <button class="btn-add" @click="addModule" style="margin-top:12px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          添加模块
        </button>
      </div>

      <!-- 右侧：预览区 -->
      <div class="card preview-card" :class="{ 'has-content': hasContent }">
        <div class="preview-header">
          <div class="card-title" style="margin-bottom:0">模块图预览</div>
          <div class="preview-hint" v-if="hasContent">节点可拖拽、画布可缩放</div>
        </div>
        <div class="preview-placeholder" v-if="!hasContent">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>在左侧添加模块和功能</p>
        </div>
        <div class="graph-container" v-show="hasContent" ref="graphRef" v-html="svgOutput" @wheel.prevent="onCanvasWheel"></div>
        <div class="export-row" :class="{ visible: hasContent }">
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import Toast from '../components/Toast.vue'
import { toPng } from 'html-to-image'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// Data model
const systemName = ref('系统')
const modules = ref([
  {
    id: uid(),
    name: '模块1',
    children: [
      { id: uid(), name: '功能1', type: 'function' },
      { id: uid(), name: '功能2', type: 'function' },
      { id: uid(), name: '子模块', type: 'module', children: [
        { id: uid(), name: '功能', type: 'function' }
      ]}
    ]
  }
])
const svgOutput = ref('')
const hasContent = ref(false)
const graphRef = ref(null)
const toastRef = ref(null)

// Node dimensions
const ROOT_W = 200
const ROOT_H = 50
const MOD_W = 150
const MOD_H = 50
const FUNC_CHAR_H = 30
const FUNC_W = 46
const FUNC_PAD = 10
const H_GAP = 40
const V_GAP = 75

// Node position map: { nodeId: { x, y, w, h } }
let _nodePositions = {}
// Connection info: [{ fromId, toId }]
let _connections = []

function addModule() {
  modules.value.push({ id: uid(), name: '', children: [] })
  onDataChange()
}

function removeModule(mi) {
  modules.value.splice(mi, 1)
  onDataChange()
}

function addChild(parent, type) {
  if (!parent.children) parent.children = []
  parent.children.push({ id: uid(), name: '', type, children: type === 'module' ? [] : undefined })
  onDataChange()
}

function removeChild(parent, ci) {
  parent.children.splice(ci, 1)
  onDataChange()
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function onDataChange() {
  nextTick(() => renderDiagram())
}

// Recursively calculate the width needed for a node and all its descendants
function calcSubtreeWidth(node) {
  const isFunc = node.type === 'function'
  const nodeW = isFunc ? FUNC_W : MOD_W

  if (!node.children || node.children.length === 0) {
    return nodeW
  }

  let childrenTotalW = 0
  for (let i = 0; i < node.children.length; i++) {
    if (i > 0) childrenTotalW += H_GAP
    childrenTotalW += calcSubtreeWidth(node.children[i])
  }

  return Math.max(nodeW, childrenTotalW)
}

// Recursively layout nodes, returns { x, y, w, h } for each node
function layoutSubtree(node, cx, y) {
  const isFunc = node.type === 'function'
  const nodeW = isFunc ? FUNC_W : MOD_W
  const nodeH = isFunc ? (node.name.length * FUNC_CHAR_H + FUNC_PAD * 2) : MOD_H
  const nodeId = node.id

  _nodePositions[nodeId] = { x: cx, y, w: nodeW, h: nodeH }

  if (!node.children || node.children.length === 0) return

  // Calculate widths of all children
  const childWidths = node.children.map(c => calcSubtreeWidth(c))
  const totalChildW = childWidths.reduce((s, w) => s + w, 0) + (node.children.length - 1) * H_GAP

  let startX = cx - totalChildW / 2
  const childY = y + nodeH / 2 + V_GAP

  for (let i = 0; i < node.children.length; i++) {
    const childCx = startX + childWidths[i] / 2
    _connections.push({ fromId: nodeId, toId: node.children[i].id })
    layoutSubtree(node.children[i], childCx, childY)
    startX += childWidths[i] + H_GAP
  }
}

function renderDiagram() {
  const sysName = systemName.value.trim()
  if (!sysName && modules.value.length === 0) {
    svgOutput.value = ''
    hasContent.value = false
    _nodePositions = {}
    _connections = []
    return
  }

  _nodePositions = {}
  _connections = []

  // Layout root node
  const rootId = '__root__'
  _nodePositions[rootId] = { x: 0, y: 0, w: ROOT_W, h: ROOT_H }

  // Layout modules
  const validModules = modules.value.filter(m => m.name.trim() || (m.children && m.children.some(c => c.name.trim())))

  if (validModules.length > 0) {
    const modWidths = validModules.map(m => calcSubtreeWidth(m))
    const totalModW = modWidths.reduce((s, w) => s + w, 0) + (validModules.length - 1) * H_GAP

    let startX = -totalModW / 2
    const modY = ROOT_H / 2 + V_GAP

    for (let i = 0; i < validModules.length; i++) {
      const modCx = startX + modWidths[i] / 2
      _connections.push({ fromId: rootId, toId: validModules[i].id })
      layoutSubtree(validModules[i], modCx, modY)
      startX += modWidths[i] + H_GAP
    }
  }

  // Calculate viewBox bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [id, pos] of Object.entries(_nodePositions)) {
    minX = Math.min(minX, pos.x - pos.w / 2)
    maxX = Math.max(maxX, pos.x + pos.w / 2)
    minY = Math.min(minY, pos.y - pos.h / 2)
    maxY = Math.max(maxY, pos.y + pos.h / 2)
  }

  const padX = 80
  const padY = 60
  const vbX = minX - padX
  const vbY = minY - padY
  const vbW = Math.max((maxX - minX) + padX * 2, 400)
  const vbH = Math.max((maxY - minY) + padY * 2, 200)

  const parts = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" style="background:#ffffff;user-select:none;font-family:'Noto Sans SC',sans-serif">`)

  // Root transform group for pan/zoom
  parts.push(`<g class="canvas-root">`)

  // Links layer
  parts.push(`<g class="links">`)
  for (const conn of _connections) {
    const fromPos = _nodePositions[conn.fromId]
    const toPos = _nodePositions[conn.toId]
    if (!fromPos || !toPos) continue

    const x1 = fromPos.x
    const y1 = fromPos.y + fromPos.h / 2
    const x2 = toPos.x
    const y2 = toPos.y - toPos.h / 2
    const midY = (y1 + y2) / 2

    parts.push(`<path class="link-line" data-from="${conn.fromId}" data-to="${conn.toId}" stroke="#000000" stroke-width="2" fill="none" d="M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}"/>`)
  }
  parts.push(`</g>`)

  // Nodes layer
  parts.push(`<g class="nodes">`)

  // Root node
  if (sysName) {
    const pos = _nodePositions[rootId]
    parts.push(`<g class="node-group" data-id="${rootId}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
    parts.push(`<rect x="${-ROOT_W / 2}" y="${-ROOT_H / 2}" width="${ROOT_W}" height="${ROOT_H}" fill="#ffffff" stroke="#000000" stroke-width="2" rx="0"/>`)
    parts.push(`<text text-anchor="middle" fill="#000000" font-size="30"><tspan x="0" dy="0.35em">${escapeXml(sysName)}</tspan></text>`)
    parts.push(`</g>`)
  }

  // Module and function nodes
  for (const mod of validModules) {
    renderNode(parts, mod)
  }

  parts.push(`</g>`)
  parts.push(`</g>`) // close canvas-root
  parts.push('</svg>')

  svgOutput.value = parts.join('\n')
  hasContent.value = true

  nextTick(() => {
    _viewState = { panX: 0, panY: 0, zoom: 1 }
    enableDrag()
  })
}

function renderNode(parts, node) {
  const pos = _nodePositions[node.id]
  if (!pos) return

  if (node.type === 'function') {
    // Function node: vertical text
    const chars = node.name.split('')
    const nodeH = chars.length * FUNC_CHAR_H + FUNC_PAD * 2
    parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
    parts.push(`<rect x="${-FUNC_W / 2}" y="${-nodeH / 2}" width="${FUNC_W}" height="${nodeH}" fill="#ffffff" stroke="#000000" stroke-width="2" rx="0"/>`)
    for (let i = 0; i < chars.length; i++) {
      const charY = -nodeH / 2 + FUNC_PAD + FUNC_CHAR_H / 2 + i * FUNC_CHAR_H
      parts.push(`<text x="0" y="${charY}" text-anchor="middle" dominant-baseline="middle" fill="#000000" font-size="30">${escapeXml(chars[i])}</text>`)
    }
    parts.push(`</g>`)
  } else {
    // Module node
    parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
    parts.push(`<rect x="${-MOD_W / 2}" y="${-MOD_H / 2}" width="${MOD_W}" height="${MOD_H}" fill="#ffffff" stroke="#000000" stroke-width="2" rx="0"/>`)
    parts.push(`<text text-anchor="middle" fill="#000000" font-size="30"><tspan x="0" dy="0.35em">${escapeXml(node.name)}</tspan></text>`)
    parts.push(`</g>`)

    // Render children
    if (node.children) {
      for (const child of node.children) {
        renderNode(parts, child)
      }
    }
  }
}

// Drag & zoom state
let _nodeDrag = null
let _panDrag = null
let _viewState = { panX: 0, panY: 0, zoom: 1 }
let _boundNodeMouseDown = null
let _boundPanMouseDown = null
let _boundDragMove = null
let _boundDragUp = null

function enableDrag() {
  const container = graphRef.value
  if (!container) return

  if (_boundNodeMouseDown) {
    container.removeEventListener('mousedown', _boundNodeMouseDown)
    container.removeEventListener('mousedown', _boundPanMouseDown)
    document.removeEventListener('mousemove', _boundDragMove)
    document.removeEventListener('mouseup', _boundDragUp)
  }

  _boundNodeMouseDown = onNodeMouseDown
  _boundPanMouseDown = onPanMouseDown
  _boundDragMove = onDragMove
  _boundDragUp = onDragUp

  container.addEventListener('mousedown', onNodeMouseDown)
  container.addEventListener('mousedown', onPanMouseDown)
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragUp)
}

function getCanvasScale() {
  const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
  if (!svg) return 1
  const svgRect = svg.getBoundingClientRect()
  const vb = svg.viewBox.baseVal
  return vb.width / svgRect.width
}

function onNodeMouseDown(e) {
  const el = e.target.closest('.node-group')
  if (!el) return
  e.preventDefault(); e.stopPropagation()
  const nodeId = el.getAttribute('data-id')
  const pos = _nodePositions[nodeId]
  if (!pos) return
  const scale = getCanvasScale()
  _nodeDrag = { el, nodeId, startMouseX: e.clientX, startMouseY: e.clientY, origX: pos.x, origY: pos.y, scale }
}

function onPanMouseDown(e) {
  if (_nodeDrag || e.target.closest('.node-group')) return
  e.preventDefault()
  _panDrag = { startMouseX: e.clientX, startMouseY: e.clientY, startPanX: _viewState.panX, startPanY: _viewState.panY }
}

function onDragMove(e) {
  if (_nodeDrag) {
    e.preventDefault()
    const scale = _nodeDrag.scale * _viewState.zoom
    const dx = (e.clientX - _nodeDrag.startMouseX) * scale
    const dy = (e.clientY - _nodeDrag.startMouseY) * scale
    const newX = _nodeDrag.origX + dx
    const newY = _nodeDrag.origY + dy
    _nodePositions[_nodeDrag.nodeId] = { ..._nodePositions[_nodeDrag.nodeId], x: newX, y: newY }
    _nodeDrag.el.setAttribute('transform', `translate(${newX},${newY})`)
    updateAllLines()
  } else if (_panDrag) {
    e.preventDefault()
    const scale = getCanvasScale() * _viewState.zoom
    const dx = (e.clientX - _panDrag.startMouseX) * scale
    const dy = (e.clientY - _panDrag.startMouseY) * scale
    _viewState.panX = _panDrag.startPanX + dx
    _viewState.panY = _panDrag.startPanY + dy
    applyCanvasTransform()
  }
}

function onDragUp() {
  _nodeDrag = null; _panDrag = null
}

function updateAllLines() {
  const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
  if (!svg) return

  const lines = svg.querySelectorAll('.link-line')
  lines.forEach(line => {
    const fromId = line.getAttribute('data-from')
    const toId = line.getAttribute('data-to')
    const fromPos = _nodePositions[fromId]
    const toPos = _nodePositions[toId]
    if (!fromPos || !toPos) return

    const x1 = fromPos.x
    const y1 = fromPos.y + fromPos.h / 2
    const x2 = toPos.x
    const y2 = toPos.y - toPos.h / 2
    const midY = (y1 + y2) / 2

    line.setAttribute('d', `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`)
  })
}

function applyCanvasTransform() {
  const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
  if (!svg) return
  const root = svg.querySelector('.canvas-root')
  if (!root) return
  root.setAttribute('transform', `translate(${_viewState.panX},${_viewState.panY}) scale(${_viewState.zoom})`)
}

function onCanvasWheel(e) {
  const factor = e.deltaY > 0 ? 0.9 : 1.1
  _viewState.zoom = Math.max(0.2, Math.min(5, _viewState.zoom * factor))
  applyCanvasTransform()
}

function downloadSVG() {
  if (!svgOutput.value) return
  const blob = new Blob([svgOutput.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'system-module-diagram.svg'; a.click()
  URL.revokeObjectURL(url)
  toastRef.value?.show('已下载 SVG', 'success')
}

async function downloadPNG() {
  if (!svgOutput.value || !graphRef.value) return
  const svgEl = graphRef.value.querySelector('svg')
  if (!svgEl) return

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
    a.download = 'system-module-diagram.png'
    a.click()
    toastRef.value?.show('已下载 PNG', 'success')
  } catch (e) {
    toastRef.value?.show('PNG 导出失败: ' + e.message, 'error')
  } finally {
    svgEl.style.transform = origTransform
  }
}
</script>

<style scoped>
.page { max-width: 100%; margin: 0 auto; padding: 32px 15%; }
.header { text-align: center; margin-bottom: 40px; }
.header h1 { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.5px; color: var(--text-primary); margin-bottom: 8px; }
.header h1 span { color: var(--accent); }
.header p { font-size: 0.95rem; color: var(--text-secondary); font-weight: 300; }
.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: stretch; }
@media (max-width: 960px) { .main-grid { grid-template-columns: 1fr; } .page { padding: 20px; } }

.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }

/* Editor */
.editor-card { display: flex; flex-direction: column; min-height: 380px; }
.editor-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.system-name-row { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 12px; }
.btn-add { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1px solid var(--accent); border-radius: var(--radius); background: var(--accent-dim); color: var(--accent); font-family: 'Noto Sans SC', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.btn-add:hover { background: var(--accent); color: #0f1117; }
.tree { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.tree-module { border: 1px solid var(--border); border-radius: var(--radius); }
.module-node { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg-input); }
.tree-children { padding: 6px 0 6px 28px; display: flex; flex-direction: column; gap: 4px; }
.child-node { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius); background: var(--bg-card); border: 1px solid transparent; transition: border-color 0.15s; }
.child-node:hover { border-color: var(--border); }
.node-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--text-muted); }
.root-icon { color: var(--accent); }
.module-icon { color: var(--accent); }
.func-icon { color: var(--success); }
.submod-icon { color: var(--text-muted); }
.node-input { flex: 1; min-width: 0; padding: 5px 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; outline: none; transition: border-color 0.15s; }
.node-input:focus { border-color: var(--accent); }
.node-input::placeholder { color: var(--text-muted); }
.btn-node-add { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1px dashed var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.btn-node-add:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.btn-node-del { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.btn-node-del:hover { background: rgba(248,113,113,0.15); color: var(--error); }
.editor-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.9rem; }

/* Preview */
.preview-card { display: flex; flex-direction: column; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.preview-hint { font-size: 0.78rem; color: var(--text-muted); }
.preview-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 16px; min-height: 200px; }
.preview-placeholder svg { opacity: 0.3; }
.preview-placeholder p { font-size: 0.9rem; }
.graph-container { background: #ffffff; border-radius: var(--radius); overflow: hidden; position: relative; flex: 1; min-height: 200px; }
.graph-container :deep(svg) { display: block; width: 100%; height: 100%; }
.graph-container :deep(.draggable) { cursor: move; }

/* Export */
.export-row { display: none; gap: 10px; margin-top: 16px; }
.export-row.visible { display: flex; }
.btn-export { flex: 1; padding: 11px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-input); color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-export:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
</style>
