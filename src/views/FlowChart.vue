<template>
  <div class="page">
    <header class="header">
      <h1><span>Flow</span> Chart</h1>
      <p>添加节点和连线，实时生成流程图</p>
    </header>
    <div class="main-grid" :class="{ stretched: !hasContent }">
      <!-- 左侧：编辑面板 -->
      <div class="card editor-card">
        <div class="editor-toolbar">
          <div class="card-title" style="margin-bottom:0">流程图编辑器</div>
          <div class="toolbar-actions">
            <button class="btn-undo" @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button class="btn-undo" @click="redo" :disabled="!canRedo" title="重做 (Ctrl+Shift+Z)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
            <button class="btn-add" @click="addNode">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加节点
            </button>
            <button class="btn-add" @click="addEdge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="15 8 19 12 15 16"/></svg>
              添加连线
            </button>
          </div>
        </div>

        <!-- 节点列表 -->
        <div class="section-label">节点列表</div>
        <div class="tree" :class="{ 'dropdown-open': openDropdown }" v-if="nodes.length > 0">
          <div v-for="(node, ni) in nodes" :key="node.id" class="tree-node flow-node">
            <span class="node-icon" :class="nodeTypeIconClass(node.type)">
              <!-- 开始/结束: 圆角矩形 -->
              <svg v-if="node.type === 'start' || node.type === 'end'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="6"/></svg>
              <!-- 处理: 矩形 -->
              <svg v-else-if="node.type === 'process'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/></svg>
              <!-- 判断: 菱形 -->
              <svg v-else-if="node.type === 'decision'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,12 12,22 2,12"/></svg>
              <!-- 输入/输出: 平行四边形 -->
              <svg v-else-if="node.type === 'io'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6,5 22,5 18,19 2,19"/></svg>
            </span>
            <input class="node-input" v-model="node.label" placeholder="节点名称" @input="debouncedOnChange" />
            <div class="custom-select" :data-key="'node-type-' + node.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'node-type-' + node.id }" @click.stop="toggleDropdown('node-type-' + node.id)">
                <span>{{ nodeTypeLabel(node.type) }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'node-type-' + node.id">
                <div class="select-option" :class="{ selected: node.type === 'start' }" @click.stop="selectOption('node-type-' + node.id, node, 'type', 'start')">
                  <svg class="opt-icon start-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="6"/></svg>开始
                </div>
                <div class="select-option" :class="{ selected: node.type === 'process' }" @click.stop="selectOption('node-type-' + node.id, node, 'type', 'process')">
                  <svg class="opt-icon process-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/></svg>处理
                </div>
                <div class="select-option" :class="{ selected: node.type === 'decision' }" @click.stop="selectOption('node-type-' + node.id, node, 'type', 'decision')">
                  <svg class="opt-icon decision-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,12 12,22 2,12"/></svg>判断
                </div>
                <div class="select-option" :class="{ selected: node.type === 'io' }" @click.stop="selectOption('node-type-' + node.id, node, 'type', 'io')">
                  <svg class="opt-icon io-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6,5 22,5 18,19 2,19"/></svg>输入/输出
                </div>
                <div class="select-option" :class="{ selected: node.type === 'end' }" @click.stop="selectOption('node-type-' + node.id, node, 'type', 'end')">
                  <svg class="opt-icon end-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="6"/></svg>结束
                </div>
              </div>
            </div>
            <button class="btn-node-del" @click="removeNode(ni)" title="删除">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="editor-empty" v-else>
          <p>点击上方按钮添加节点</p>
        </div>

        <!-- 连线列表 -->
        <div class="relation-section" v-if="edges.length > 0">
          <div class="section-label">连线列表</div>
          <div v-for="(edge, ei) in edges" :key="edge.id" class="relation-row">
            <div class="custom-select" :data-key="'edge-from-' + edge.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'edge-from-' + edge.id }" @click.stop="toggleDropdown('edge-from-' + edge.id)">
                <span>{{ edge.from ? (nodes.find(n => n.id === edge.from)?.label || '未命名') : '来源节点' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'edge-from-' + edge.id">
                <div class="select-option" :class="{ selected: edge.from === '' }" @click.stop="selectOption('edge-from-' + edge.id, edge, 'from', '')">来源节点</div>
                <div v-for="n in nodes" :key="n.id" class="select-option" :class="{ selected: edge.from === n.id }" @click.stop="selectOption('edge-from-' + edge.id, edge, 'from', n.id)">{{ n.label || '未命名' }}</div>
              </div>
            </div>
            <span class="arrow-sep">&rarr;</span>
            <div class="custom-select" :data-key="'edge-to-' + edge.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'edge-to-' + edge.id }" @click.stop="toggleDropdown('edge-to-' + edge.id)">
                <span>{{ edge.to ? (nodes.find(n => n.id === edge.to)?.label || '未命名') : '目标节点' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'edge-to-' + edge.id">
                <div class="select-option" :class="{ selected: edge.to === '' }" @click.stop="selectOption('edge-to-' + edge.id, edge, 'to', '')">目标节点</div>
                <div v-for="n in nodes" :key="n.id" class="select-option" :class="{ selected: edge.to === n.id }" @click.stop="selectOption('edge-to-' + edge.id, edge, 'to', n.id)">{{ n.label || '未命名' }}</div>
              </div>
            </div>
            <input class="edge-label-input" v-model="edge.label" placeholder="标签" @input="onDataChange" />
            <button class="btn-node-del" @click="removeEdge(ei)" title="删除">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div class="card preview-card" :class="{ 'has-content': hasContent }">
        <div class="preview-header">
          <div class="card-title" style="margin-bottom:0">流程图预览</div>
          <div class="preview-hint" v-if="hasContent">节点可拖拽、画布可缩放</div>
        </div>
        <div class="preview-placeholder" v-if="!hasContent">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>在左侧添加节点和连线</p>
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
import { useHistory } from '../composables/useHistory.js'

const { undo, redo, canUndo, canRedo, pushHistory } = useHistory(
  () => JSON.parse(JSON.stringify({ nodes: nodes.value, edges: edges.value })),
  (snapshot) => {
    nodes.value = snapshot.nodes
    edges.value = snapshot.edges
    onDataChange()
  }
)

let _uid = 0
function uid() { return ++_uid }

// Data model
const nodes = ref([])
const edges = ref([])
const svgOutput = ref('')
const hasContent = ref(false)
const graphRef = ref(null)
const toastRef = ref(null)

// Custom dropdown state
const openDropdown = ref(null)

function toggleDropdown(key) {
  openDropdown.value = openDropdown.value === key ? null : key
}

function selectOption(key, obj, prop, value) {
  obj[prop] = value
  openDropdown.value = null
  onDataChange()
}

function onClickOutside(e) {
  if (openDropdown.value && !e.target.closest('.custom-select')) {
    openDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

// Node type helpers
function nodeTypeLabel(type) {
  const map = { start: '开始', end: '结束', process: '处理', decision: '判断', io: '输入/输出' }
  return map[type] || '处理'
}

function nodeTypeIconClass(type) {
  const map = { start: 'start-icon', end: 'end-icon', process: 'process-icon', decision: 'decision-icon', io: 'io-icon' }
  return map[type] || 'process-icon'
}

// CRUD
function addNode() {
  nodes.value.push({ id: uid(), type: 'process', label: '', x: 0, y: 0 })
  pushHistory()
  onDataChange()
}

function removeNode(ni) {
  const removedId = nodes.value[ni].id
  nodes.value.splice(ni, 1)
  edges.value = edges.value.filter(e => e.from !== removedId && e.to !== removedId)
  pushHistory()
  onDataChange()
}

function addEdge() {
  edges.value.push({ id: uid(), from: '', to: '', label: '', fromPort: 'bottom', toPort: 'top' })
  pushHistory()
  onDataChange()
}

function removeEdge(ei) {
  edges.value.splice(ei, 1)
  pushHistory()
  onDataChange()
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function onDataChange() {
  nextTick(() => renderDiagram())
}

let _debounceTimer = null
function debouncedOnChange() {
  clearTimeout(_debounceTimer)
  _debounceTimer = setTimeout(() => onDataChange(), 150)
}

// Layout constants
const NODE_H = 44
const NODE_MIN_W = 120
const NODE_PAD_X = 28
const CHAR_W = 14
const H_GAP = 60
const V_GAP = 80
const DIAMOND_SIZE = 36
const IO_SKEW = 14

// Node position map: { nodeId: { x, y, w, h } }
let _nodePositions = {}

function getNodeWidth(node) {
  const textLen = (node.label || '').length
  if (node.type === 'decision') {
    return Math.max(textLen * CHAR_W + NODE_PAD_X * 2, NODE_MIN_W)
  }
  return Math.max(textLen * CHAR_W + NODE_PAD_X * 2, NODE_MIN_W)
}

function getNodeHeight(node) {
  if (node.type === 'decision') {
    return DIAMOND_SIZE * 2
  }
  return NODE_H
}

// Simple top-to-bottom auto layout
function autoLayout() {
  const validNodes = nodes.value.filter(n => n.label.trim())
  if (validNodes.length === 0) return

  _nodePositions = {}

  // Build adjacency from edges
  const outEdges = {} // nodeId -> [targetNodeId, ...]
  const inDegree = {}
  for (const n of validNodes) {
    outEdges[n.id] = []
    inDegree[n.id] = 0
  }
  for (const edge of edges.value) {
    if (edge.from && edge.to && validNodes.find(n => n.id === edge.from) && validNodes.find(n => n.id === edge.to)) {
      outEdges[edge.from].push(edge.to)
      inDegree[edge.to] = (inDegree[edge.to] || 0) + 1
    }
  }

  // Topological sort (BFS) to determine layers
  const layers = []
  const visited = new Set()
  let queue = validNodes.filter(n => inDegree[n.id] === 0).map(n => n.id)

  // If no root nodes (cycles), just use all nodes
  if (queue.length === 0) {
    queue = validNodes.map(n => n.id)
  }

  while (queue.length > 0) {
    layers.push([...queue])
    for (const id of queue) {
      visited.add(id)
    }
    const nextQueue = []
    for (const id of queue) {
      for (const target of outEdges[id]) {
        if (!visited.has(target)) {
          nextQueue.push(target)
        }
      }
    }
    // Remove duplicates
    queue = [...new Set(nextQueue)]
    // Safety: if nothing new added, break
    if (queue.length === 0) {
      // Add any unvisited nodes
      const remaining = validNodes.filter(n => !visited.has(n.id)).map(n => n.id)
      if (remaining.length > 0) {
        layers.push(remaining)
        for (const id of remaining) visited.add(id)
      }
    }
  }

  // Layout each layer
  let currentY = 60
  for (const layer of layers) {
    const layerNodes = layer.map(id => validNodes.find(n => n.id === id)).filter(Boolean)
    const totalW = layerNodes.reduce((sum, n) => sum + getNodeWidth(n), 0) + (layerNodes.length - 1) * H_GAP
    let currentX = -totalW / 2

    for (const node of layerNodes) {
      const w = getNodeWidth(node)
      const h = getNodeHeight(node)
      const cx = currentX + w / 2
      const cy = currentY
      _nodePositions[node.id] = { x: cx, y: cy, w, h }
      currentX += w + H_GAP
    }

    // Calculate max height of this layer for next Y
    const maxH = Math.max(...layerNodes.map(n => getNodeHeight(n)))
    currentY += maxH + V_GAP
  }
}

function renderDiagram() {
  const validNodes = nodes.value.filter(n => n.label.trim())
  const validEdges = edges.value.filter(e => e.from && e.to && validNodes.find(n => n.id === e.from) && validNodes.find(n => n.id === e.to))

  if (validNodes.length === 0) {
    svgOutput.value = ''
    hasContent.value = false
    _nodePositions = {}
    return
  }

  // Auto layout
  autoLayout()

  // Calculate viewBox bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [id, pos] of Object.entries(_nodePositions)) {
    const node = validNodes.find(n => String(n.id) === String(id))
    if (!node) continue
    if (node.type === 'decision') {
      minX = Math.min(minX, pos.x - pos.w / 2)
      maxX = Math.max(maxX, pos.x + pos.w / 2)
      minY = Math.min(minY, pos.y - DIAMOND_SIZE)
      maxY = Math.max(maxY, pos.y + DIAMOND_SIZE)
    } else {
      minX = Math.min(minX, pos.x - pos.w / 2)
      maxX = Math.max(maxX, pos.x + pos.w / 2)
      minY = Math.min(minY, pos.y - pos.h / 2)
      maxY = Math.max(maxY, pos.y + pos.h / 2)
    }
  }

  const padX = 80
  const padY = 60
  const contentW = maxX - minX
  const contentH = maxY - minY
  const contentCx = (minX + maxX) / 2
  const contentCy = (minY + maxY) / 2
  const vbW = Math.max(contentW + padX * 2, 400)
  const vbH = Math.max(contentH + padY * 2, 300)
  const vbX = contentCx - vbW / 2
  const vbY = contentCy - vbH / 2

  const parts = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" style="background:#ffffff;user-select:none;font-family:'Noto Sans SC',sans-serif">`)

  // Defs: arrow marker
  parts.push(`<defs>`)
  parts.push(`<marker id="arrow-flow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M 0 0 L 12 4 L 0 8 L 3 4 Z" fill="#555"/></marker>`)
  parts.push(`</defs>`)

  // Root transform group for pan/zoom
  parts.push(`<g class="canvas-root">`)

  // Links layer
  parts.push(`<g class="links">`)
  for (const edge of validEdges) {
    const fromPos = _nodePositions[edge.from]
    const toPos = _nodePositions[edge.to]
    if (!fromPos || !toPos) continue

    const fromNode = validNodes.find(n => n.id === edge.from)
    const toNode = validNodes.find(n => n.id === edge.to)
    if (!fromNode || !toNode) continue

    // Calculate connection points
    let x1, y1, x2, y2
    const fromPort = edge.fromPort || 'bottom'
    const toPort = edge.toPort || 'top'

    // From port
    if (fromPort === 'bottom-left') {
      x1 = fromPos.x - DIAMOND_SIZE * 0.5
      y1 = fromPos.y + DIAMOND_SIZE
    } else if (fromPort === 'bottom-right') {
      x1 = fromPos.x + DIAMOND_SIZE * 0.5
      y1 = fromPos.y + DIAMOND_SIZE
    } else {
      x1 = fromPos.x
      y1 = fromPos.y + (fromNode.type === 'decision' ? DIAMOND_SIZE : fromPos.h / 2)
    }

    // To port
    x2 = toPos.x
    y2 = toPos.y - (toNode.type === 'decision' ? DIAMOND_SIZE : toPos.h / 2)

    // Orthogonal path: vertical -> horizontal -> vertical
    const midY = (y1 + y2) / 2
    const pathD = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`

    parts.push(`<g class="link-group" data-from="${edge.from}" data-to="${edge.to}" data-edge-id="${edge.id}">`)
    parts.push(`<path class="link-hit-area" stroke="transparent" stroke-width="20" fill="none" d="${pathD}"/>`)
    parts.push(`<path class="link-line" stroke="#555" stroke-width="1.5" fill="none" d="${pathD}" marker-end="url(#arrow-flow)"/>`)

    // Edge label - embedded in the middle of the horizontal segment
    if (edge.label && edge.label.trim()) {
      const labelText = escapeXml(edge.label.trim())
      const textW = edge.label.trim().length * 8 + 16
      const labelX = (x1 + x2) / 2
      const labelY = midY
      parts.push(`<g class="link-label-group" transform="translate(${labelX},${labelY})">`)
      parts.push(`<rect class="label-bg" x="${-textW / 2}" y="-10" width="${textW}" height="20" fill="#ffffff" rx="3"/>`)
      parts.push(`<text text-anchor="middle" dominant-baseline="central" fill="#555" font-size="11">${labelText}</text>`)
      parts.push(`</g>`)
    }

    parts.push(`</g>`)
  }
  parts.push(`</g>`)

  // Nodes layer
  parts.push(`<g class="nodes">`)
  for (const node of validNodes) {
    const pos = _nodePositions[node.id]
    if (!pos) continue

    const w = pos.w
    const h = pos.h
    const label = escapeXml(node.label.trim())

    if (node.type === 'start' || node.type === 'end') {
      // Rounded rectangle / ellipse
      const rx = h / 2
      parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
      parts.push(`<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${rx}" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>`)
      parts.push(`<text text-anchor="middle" fill="#000000" font-size="13"><tspan x="0" dy="0.35em">${label}</tspan></text>`)
      parts.push(`</g>`)
    } else if (node.type === 'process') {
      // Rectangle
      parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
      parts.push(`<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>`)
      parts.push(`<text text-anchor="middle" fill="#000000" font-size="13"><tspan x="0" dy="0.35em">${label}</tspan></text>`)
      parts.push(`</g>`)
    } else if (node.type === 'decision') {
      // Diamond
      const dw = w / 2
      const dh = DIAMOND_SIZE
      parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
      parts.push(`<polygon points="0,${-dh} ${dw},0 0,${dh} ${-dw},0" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>`)
      parts.push(`<text text-anchor="middle" fill="#000000" font-size="13"><tspan x="0" dy="0.35em">${label}</tspan></text>`)
      parts.push(`</g>`)
    } else if (node.type === 'io') {
      // Parallelogram
      const skew = IO_SKEW
      parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
      parts.push(`<polygon points="${-w / 2 + skew},${-h / 2} ${w / 2 + skew},${-h / 2} ${w / 2 - skew},${h / 2} ${-w / 2 - skew},${h / 2}" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>`)
      parts.push(`<text text-anchor="middle" fill="#000000" font-size="13"><tspan x="0" dy="0.35em">${label}</tspan></text>`)
      parts.push(`</g>`)
    }
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
  const svg = container.querySelector('svg')
  if (!svg) {
    setTimeout(() => enableDrag(), 50)
    return
  }

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

  const linkGroups = svg.querySelectorAll('.link-group')
  linkGroups.forEach(group => {
    const fromId = group.getAttribute('data-from')
    const toId = group.getAttribute('data-to')
    const edgeId = group.getAttribute('data-edge-id')
    const fromPos = _nodePositions[fromId]
    const toPos = _nodePositions[toId]
    if (!fromPos || !toPos) return

    const edge = edges.value.find(e => String(e.id) === String(edgeId))
    const fromNode = nodes.value.find(n => String(n.id) === String(fromId))
    const toNode = nodes.value.find(n => String(n.id) === String(toId))
    if (!fromNode || !toNode) return

    const fromPort = edge?.fromPort || 'bottom'
    const toPort = edge?.toPort || 'top'

    let x1, y1, x2, y2

    if (fromPort === 'bottom-left') {
      x1 = fromPos.x - DIAMOND_SIZE * 0.5
      y1 = fromPos.y + DIAMOND_SIZE
    } else if (fromPort === 'bottom-right') {
      x1 = fromPos.x + DIAMOND_SIZE * 0.5
      y1 = fromPos.y + DIAMOND_SIZE
    } else {
      x1 = fromPos.x
      y1 = fromPos.y + (fromNode.type === 'decision' ? DIAMOND_SIZE : fromPos.h / 2)
    }

    x2 = toPos.x
    y2 = toPos.y - (toNode.type === 'decision' ? DIAMOND_SIZE : toPos.h / 2)

    const midY = (y1 + y2) / 2
    const pathD = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`

    const hitArea = group.querySelector('.link-hit-area')
    const line = group.querySelector('.link-line')
    if (hitArea) hitArea.setAttribute('d', pathD)
    if (line) line.setAttribute('d', pathD)

    // Update label position
    const labelGroup = group.querySelector('.link-label-group')
    if (labelGroup && edge?.label?.trim()) {
      const labelX = (x1 + x2) / 2
      const labelY = midY
      const textW = edge.label.trim().length * 8 + 16
      const labelBg = labelGroup.querySelector('.label-bg')
      if (labelBg) {
        labelBg.setAttribute('x', -textW / 2)
        labelBg.setAttribute('width', textW)
      }
      labelGroup.setAttribute('transform', `translate(${labelX},${labelY})`)
    }
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
  a.href = url; a.download = 'flowchart.svg'; a.click()
  URL.revokeObjectURL(url)
  toastRef.value?.show('已下载 SVG', 'success')
}

async function downloadPNG() {
  if (!svgOutput.value || !graphRef.value) return
  const svgEl = graphRef.value.querySelector('svg')
  if (!svgEl) return

  const clone = svgEl.cloneNode(true)
  clone.style.transform = ''
  clone.style.maxWidth = 'none'

  const vb = svgEl.viewBox.baseVal
  const w = vb.width || 800
  const h = vb.height || 600
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const svgStr = new XMLSerializer().serializeToString(clone)
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))

  const img = new Image()
  img.onload = () => {
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
      a.download = 'flowchart.png'
      a.click()
      URL.revokeObjectURL(a.href)
      toastRef.value?.show('已下载 PNG', 'success')
    }, 'image/png')
  }
  img.onerror = () => {
    toastRef.value?.show('PNG 导出失败', 'error')
  }
  img.src = dataUrl
}
</script>

<style scoped>
.page { max-width: 100%; margin: 0 auto; padding: 32px 15%; }
.header { text-align: center; margin-bottom: 40px; }
.header h1 { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.5px; color: var(--text-primary); margin-bottom: 8px; }
.header h1 span { color: var(--accent); }
.header p { font-size: 0.95rem; color: var(--text-secondary); font-weight: 300; }
.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.main-grid.stretched { align-items: stretch; }
@media (max-width: 960px) { .main-grid { grid-template-columns: 1fr; } .page { padding: 20px; } }

.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }

/* Editor */
.editor-card { display: flex; flex-direction: column; min-height: 380px; }
.editor-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-actions { display: flex; gap: 6px; align-items: center; }
.btn-undo { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-input); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; }
.btn-undo:hover:not(:disabled) { border-color: var(--text-muted); color: var(--text-primary); }
.btn-undo:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-add { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1px solid var(--accent); border-radius: var(--radius); background: var(--accent-dim); color: var(--accent); font-family: 'Noto Sans SC', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.btn-add:hover { background: var(--accent); color: #0f1117; }

.section-label { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }

.tree { flex: 1; overflow-y: auto; overflow-x: visible; display: flex; flex-direction: column; gap: 6px; }
.tree.dropdown-open { overflow-y: visible; }
.flow-node { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius); transition: border-color 0.15s; }
.flow-node:hover { border-color: var(--text-muted); }
.node-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--text-muted); }
.start-icon { color: var(--success); }
.end-icon { color: var(--error); }
.process-icon { color: var(--accent); }
.decision-icon { color: #f59e0b; }
.io-icon { color: #8b5cf6; }
.node-input { flex: 1; min-width: 0; padding: 5px 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; outline: none; transition: border-color 0.15s; }
.node-input:focus { border-color: var(--accent); }
.node-input::placeholder { color: var(--text-muted); }
.btn-node-del { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.btn-node-del:hover { background: rgba(248,113,113,0.15); color: var(--error); }
.editor-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.9rem; }

/* Custom dropdown */
.custom-select { position: relative; flex-shrink: 0; }
.select-trigger { display: flex; align-items: center; justify-content: center; padding: 5px 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.78rem; cursor: pointer; min-width: 100px; user-select: none; transition: border-color 0.15s; text-align: center; }
.select-trigger:hover, .select-trigger.open { border-color: var(--accent); }
.select-trigger .arrow { transition: transform 0.2s; margin-left: 4px; }
.select-trigger.open .arrow { transform: rotate(180deg); }
.select-dropdown { position: absolute; top: 100%; left: 0; min-width: 120px; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; overflow: hidden; }
.select-option { display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer; transition: background 0.1s; text-align: center; }
.select-option:hover { background: var(--accent-dim); color: var(--text-primary); }
.select-option.selected { color: var(--accent); }
.opt-icon { flex-shrink: 0; }
.opt-icon.start-icon { color: var(--success); }
.opt-icon.end-icon { color: var(--error); }
.opt-icon.process-icon { color: var(--accent); }
.opt-icon.decision-icon { color: #f59e0b; }
.opt-icon.io-icon { color: #8b5cf6; }

/* Relations / Edges */
.relation-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.relation-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.arrow-sep { color: var(--text-muted); font-size: 0.9rem; flex-shrink: 0; }
.edge-label-input { width: 100px; padding: 5px 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.82rem; outline: none; transition: border-color 0.15s; flex-shrink: 0; }
.edge-label-input:focus { border-color: var(--accent); }
.edge-label-input::placeholder { color: var(--text-muted); }

/* Preview */
.preview-card { display: flex; flex-direction: column; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.preview-hint { font-size: 0.78rem; color: var(--text-muted); }
.preview-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 16px; min-height: 200px; }
.preview-placeholder svg { opacity: 0.3; }
.preview-placeholder p { font-size: 0.9rem; }
.graph-container { background: #ffffff; border-radius: var(--radius); overflow: visible; position: relative; flex: 1; min-height: 200px; }
.graph-container :deep(svg) { display: block; width: 100%; height: 100%; }
.graph-container :deep(.draggable) { cursor: move; }

/* Export */
.export-row { display: none; gap: 10px; margin-top: 16px; }
.export-row.visible { display: flex; }
.btn-export { flex: 1; padding: 11px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-input); color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-export:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
</style>
