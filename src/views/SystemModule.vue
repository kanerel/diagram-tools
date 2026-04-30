<template>
  <div class="page">
    <header class="header">
      <h1><span>System</span> Module</h1>
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
          <button class="btn-node-add" @click="addModule" title="添加模块">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <!-- 模块列表 -->
        <div class="tree" v-if="modules.length > 0">
          <div v-for="(mod, mi) in modules" :key="mod.id" class="tree-module">
            <div class="tree-node module-node">
              <span class="node-icon module-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </span>
              <input class="node-input" v-model="mod.name" placeholder="模块名称" @input="onDataChange" />
              <div class="custom-select">
                <button class="btn-node-add" @click.stop="toggleDropdown('mod-' + mod.id, $event)" title="添加">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <Teleport to="body">
                  <div class="select-dropdown" v-if="openDropdown === 'mod-' + mod.id" :style="dropdownStyle">
                    <div class="select-option" @click.stop="addChild(mod, 'module'); closeDropdown()">模块</div>
                    <div class="select-option" @click.stop="addChild(mod, 'function'); closeDropdown()">功能</div>
                  </div>
                </Teleport>
              </div>
              <button class="btn-node-del" @click="removeModule(mi)" title="删除">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            <!-- 子节点 -->
            <div class="tree-children" v-if="mod.children && mod.children.length > 0">
              <template v-for="(child, ci) in mod.children" :key="child.id">
                <div class="tree-node child-node">
                  <span class="node-icon" :class="child.type === 'function' ? 'func-icon' : 'submod-icon'">
                    <svg v-if="child.type === 'function'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  </span>
                  <input class="node-input" v-model="child.name" :placeholder="child.type === 'function' ? '功能名称' : '子模块名称'" @input="onDataChange" />
                  <div v-if="child.type === 'module'" class="custom-select">
                    <button class="btn-node-add" @click.stop="toggleDropdown('child-' + child.id, $event)" title="添加">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <Teleport to="body">
                      <div class="select-dropdown" v-if="openDropdown === 'child-' + child.id" :style="dropdownStyle">
                        <div class="select-option" @click.stop="addChild(child, 'module'); closeDropdown()">模块</div>
                        <div class="select-option" @click.stop="addChild(child, 'function'); closeDropdown()">功能</div>
                      </div>
                    </Teleport>
                  </div>
                  <button class="btn-node-del" @click="removeChild(mod, ci)" title="删除">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <!-- Recursive children for sub-modules -->
                <div class="tree-children" v-if="child.type === 'module' && child.children && child.children.length > 0">
                  <template v-for="(grandchild, gi) in child.children" :key="grandchild.id">
                    <div class="tree-node child-node">
                      <span class="node-icon" :class="grandchild.type === 'function' ? 'func-icon' : 'submod-icon'">
                        <svg v-if="grandchild.type === 'function'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                      </span>
                      <input class="node-input" v-model="grandchild.name" :placeholder="grandchild.type === 'function' ? '功能名称' : '子模块名称'" @input="onDataChange" />
                      <div v-if="grandchild.type === 'module'" class="custom-select">
                        <button class="btn-node-add" @click.stop="toggleDropdown('gc-' + grandchild.id, $event)" title="添加">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <Teleport to="body">
                          <div class="select-dropdown" v-if="openDropdown === 'gc-' + grandchild.id" :style="dropdownStyle">
                            <div class="select-option" @click.stop="addChild(grandchild, 'module'); closeDropdown()">模块</div>
                            <div class="select-option" @click.stop="addChild(grandchild, 'function'); closeDropdown()">功能</div>
                          </div>
                        </Teleport>
                      </div>
                      <button class="btn-node-del" @click="removeChild(child, gi)" title="删除">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="editor-empty" v-else>
          <p>点击上方 + 按钮添加模块</p>
        </div>
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
const modules = ref([])
const svgOutput = ref('')
const hasContent = ref(false)
const openDropdown = ref(null)
const dropdownStyle = ref({})

function toggleDropdown(id, event) {
  if (openDropdown.value === id) {
    openDropdown.value = null
    return
  }
  const btn = event.currentTarget
  const rect = btn.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: (rect.bottom + 4) + 'px',
    left: (rect.left + rect.width / 2 - 40) + 'px',
    width: '80px'
  }
  openDropdown.value = id
}
function closeDropdown() {
  openDropdown.value = null
}
const graphRef = ref(null)
const toastRef = ref(null)

// Node dimensions
const ROOT_MIN_W = 200
const ROOT_H = 70
const ROOT_PAD_X = 40
const MOD_MIN_W = 150
const MOD_H = 70
const MOD_PAD_X = 30
const FUNC_CHAR_H = 30
const FUNC_W = 70
const FUNC_MIN_H = 120
const FUNC_PAD = 30
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
  const nodeW = isFunc ? FUNC_W : Math.max(node.name.length * 30 + MOD_PAD_X * 2, MOD_MIN_W)

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
  const nodeW = isFunc ? FUNC_W : Math.max(node.name.length * 30 + MOD_PAD_X * 2, MOD_MIN_W)
  const nodeId = node.id

  if (!node.children || node.children.length === 0) {
    const rawH = isFunc ? (node.name.length * FUNC_CHAR_H + FUNC_PAD * 2) : MOD_H
    const nodeH = isFunc ? Math.max(rawH, FUNC_MIN_H) : MOD_H
    // For function nodes, y = top edge; for modules, y = center
    _nodePositions[nodeId] = { x: cx, y: isFunc ? y : y, w: nodeW, h: nodeH, isFunc }
    return
  }

  // Find max function height among children for uniform height
  let maxFuncH = 0
  for (const child of node.children) {
    if (child.type === 'function') {
      const h = child.name.length * FUNC_CHAR_H + FUNC_PAD * 2
      if (h > maxFuncH) maxFuncH = h
    }
  }
  maxFuncH = Math.max(maxFuncH, FUNC_MIN_H)

  const nodeH = isFunc ? maxFuncH : MOD_H
  _nodePositions[nodeId] = { x: cx, y, w: nodeW, h: nodeH, isFunc }

  // Calculate widths of all children
  const childWidths = node.children.map(c => calcSubtreeWidth(c))
  const totalChildW = childWidths.reduce((s, w) => s + w, 0) + (node.children.length - 1) * H_GAP

  let startX = cx - totalChildW / 2
  // childY: for function children = top edge, for module children = center
  const childY = y + nodeH / 2 + V_GAP

  for (let i = 0; i < node.children.length; i++) {
    const childCx = startX + childWidths[i] / 2
    _connections.push({ fromId: nodeId, toId: node.children[i].id })
    layoutSubtreeWithFuncH(node.children[i], childCx, childY, maxFuncH)
    startX += childWidths[i] + H_GAP
  }
}

// Layout with inherited maxFuncH from parent
function layoutSubtreeWithFuncH(node, cx, y, parentMaxFuncH) {
  const isFunc = node.type === 'function'
  const nodeW = isFunc ? FUNC_W : Math.max(node.name.length * 30 + MOD_PAD_X * 2, MOD_MIN_W)
  const nodeId = node.id

  if (!node.children || node.children.length === 0) {
    const nodeH = isFunc ? (parentMaxFuncH || Math.max(node.name.length * FUNC_CHAR_H + FUNC_PAD * 2, FUNC_MIN_H)) : MOD_H
    _nodePositions[nodeId] = { x: cx, y, w: nodeW, h: nodeH, isFunc }
    return
  }

  // Find max function height among this node's children
  let maxFuncH = 0
  for (const child of node.children) {
    if (child.type === 'function') {
      const h = child.name.length * FUNC_CHAR_H + FUNC_PAD * 2
      if (h > maxFuncH) maxFuncH = h
    }
  }
  maxFuncH = Math.max(maxFuncH, FUNC_MIN_H)
  maxFuncH = Math.max(maxFuncH, parentMaxFuncH || 0)

  const nodeH = isFunc ? maxFuncH : MOD_H
  _nodePositions[nodeId] = { x: cx, y, w: nodeW, h: nodeH, isFunc }

  // Calculate widths of all children
  const childWidths = node.children.map(c => calcSubtreeWidth(c))
  const totalChildW = childWidths.reduce((s, w) => s + w, 0) + (node.children.length - 1) * H_GAP

  let startX = cx - totalChildW / 2
  const childY = y + nodeH / 2 + V_GAP

  for (let i = 0; i < node.children.length; i++) {
    const childCx = startX + childWidths[i] / 2
    _connections.push({ fromId: nodeId, toId: node.children[i].id })
    layoutSubtreeWithFuncH(node.children[i], childCx, childY, maxFuncH)
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

  // Layout root node - width adapts to text length
  const rootId = '__root__'
  const rootTextW = systemName.value.length * 30 + ROOT_PAD_X * 2
  const rootW = Math.max(rootTextW, ROOT_MIN_W)
  _nodePositions[rootId] = { x: 0, y: 0, w: rootW, h: ROOT_H }

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
    // fromPos: function = top-edge y, module = center y
    const y1 = fromPos.isFunc ? fromPos.y + fromPos.h : fromPos.y + fromPos.h / 2
    const x2 = toPos.x
    // toPos: function = top-edge y, module = center y
    const y2 = toPos.isFunc ? toPos.y : toPos.y - toPos.h / 2
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
    parts.push(`<rect x="${-pos.w / 2}" y="${-ROOT_H / 2}" width="${pos.w}" height="${ROOT_H}" fill="#ffffff" stroke="#000000" stroke-width="2" rx="0"/>`)
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
    // Function node: y = top edge, rect draws downward
    const nodeH = pos.h
    const chars = node.name.split('')
    const totalTextH = chars.length * FUNC_CHAR_H
    parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
    parts.push(`<rect x="${-FUNC_W / 2}" y="0" width="${FUNC_W}" height="${nodeH}" fill="#ffffff" stroke="#000000" stroke-width="2" rx="0"/>`)
    for (let i = 0; i < chars.length; i++) {
      const charY = (nodeH - totalTextH) / 2 + FUNC_CHAR_H / 2 + i * FUNC_CHAR_H
      parts.push(`<text x="0" y="${charY}" text-anchor="middle" dominant-baseline="middle" fill="#000000" font-size="30">${escapeXml(chars[i])}</text>`)
    }
    parts.push(`</g>`)
  } else {
    // Module node
    parts.push(`<g class="node-group" data-id="${node.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
    parts.push(`<rect x="${-pos.w / 2}" y="${-MOD_H / 2}" width="${pos.w}" height="${MOD_H}" fill="#ffffff" stroke="#000000" stroke-width="2" rx="0"/>`)
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
  // Store original positions for node and all descendants
  const descIds = findDescendantIds(nodeId)
  const origPositions = {}
  origPositions[nodeId] = { x: pos.x, y: pos.y }
  for (const did of descIds) {
    const dp = _nodePositions[did]
    if (dp) origPositions[did] = { x: dp.x, y: dp.y }
  }
  _nodeDrag = { el, nodeId, startMouseX: e.clientX, startMouseY: e.clientY, origPositions, scale }
}

function onPanMouseDown(e) {
  if (_nodeDrag || e.target.closest('.node-group')) return
  e.preventDefault()
  _panDrag = { startMouseX: e.clientX, startMouseY: e.clientY, startPanX: _viewState.panX, startPanY: _viewState.panY }
}

function findDescendantIds(nodeId) {
  const ids = []
  const visited = new Set()
  const queue = [nodeId]
  while (queue.length > 0) {
    const id = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    for (const conn of _connections) {
      if (conn.fromId === id && !visited.has(conn.toId)) {
        ids.push(conn.toId)
        queue.push(conn.toId)
      }
    }
  }
  return ids
}

function onDragMove(e) {
  if (_nodeDrag) {
    e.preventDefault()
    const scale = _nodeDrag.scale * _viewState.zoom
    const dx = (e.clientX - _nodeDrag.startMouseX) * scale
    const dy = (e.clientY - _nodeDrag.startMouseY) * scale
    const newX = _nodeDrag.origPositions[_nodeDrag.nodeId].x + dx
    const newY = _nodeDrag.origPositions[_nodeDrag.nodeId].y + dy
    _nodePositions[_nodeDrag.nodeId] = { ..._nodePositions[_nodeDrag.nodeId], x: newX, y: newY }
    _nodeDrag.el.setAttribute('transform', `translate(${newX},${newY})`)

    // Move all descendant nodes using their original positions + delta
    const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
    if (svg) {
      for (const descId of findDescendantIds(_nodeDrag.nodeId)) {
        const orig = _nodeDrag.origPositions[descId]
        if (!orig) continue
        const descNewX = orig.x + dx
        const descNewY = orig.y + dy
        _nodePositions[descId] = { ..._nodePositions[descId], x: descNewX, y: descNewY }
        const descEl = svg.querySelector(`.node-group[data-id="${descId}"]`)
        if (descEl) descEl.setAttribute('transform', `translate(${descNewX},${descNewY})`)
      }
    }

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
    const y1 = fromPos.isFunc ? fromPos.y + fromPos.h : fromPos.y + fromPos.h / 2
    const x2 = toPos.x
    const y2 = toPos.isFunc ? toPos.y : toPos.y - toPos.h / 2
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

  const clone = svgEl.cloneNode(true)
  clone.style.transform = ''
  clone.style.maxWidth = 'none'

  const vb = svgEl.viewBox.baseVal
  const bbox = svgEl.getBBox()
  const w = vb.width || bbox.width || 800
  const h = vb.height || bbox.height || 600
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
      a.download = 'system-module-diagram.png'
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

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
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
/* Custom dropdown */
.custom-select { position: relative; }
.select-dropdown { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; overflow: hidden; }
.select-option { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 10px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer; transition: background 0.1s; text-align: center; }
.select-option:hover { background: var(--accent-dim); color: var(--text-primary); }
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
