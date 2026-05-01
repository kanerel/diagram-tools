<template>
  <div class="page">
    <header class="header">
      <h1><span>Use Case</span> Diagram</h1>
      <p>添加参与者和用例，实时生成 UML 用例图</p>
    </header>
    <div class="main-grid" :class="{ stretched: !hasContent }">
      <!-- 左侧：树形编辑器 -->
      <div class="card editor-card">
        <div class="editor-toolbar">
          <div class="card-title" style="margin-bottom:0">用例编辑器</div>
          <div class="toolbar-actions">
            <button class="btn-undo" @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button class="btn-undo" @click="redo" :disabled="!canRedo" title="重做 (Ctrl+Shift+Z)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
            <button class="btn-add" @click="addActor">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加参与者
            </button>
          </div>
        </div>
        <div class="tree" v-if="actors.length > 0">
          <div v-for="(actor, ai) in actors" :key="actor.id" class="tree-actor">
            <div class="tree-node actor-node">
              <span class="node-icon actor-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="12" y1="16" x2="8" y2="22"/><line x1="12" y1="16" x2="16" y2="22"/></svg>
              </span>
              <input class="node-input" v-model="actor.name" placeholder="参与者名称" @input="onDataChange" />
              <label class="boundary-check" title="系统边界">
                <input type="checkbox" v-model="actor.hasBoundary" @change="onDataChange" />
                <span>边界</span>
              </label>
              <input v-if="actor.hasBoundary" class="node-input boundary-name-input" v-model="actor.boundaryName" placeholder="边界名称" @input="onDataChange" />
              <button class="btn-node-add" @click="addUseCase(ai)" title="添加用例">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="btn-node-del" @click="removeActor(ai)" title="删除">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            <!-- 用例列表 -->
            <div class="tree-children" v-if="actor.cases.length > 0">
              <div v-for="(uc, ci) in actor.cases" :key="uc.id" class="tree-node case-node">
                <span class="node-icon case-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="7"/></svg>
                </span>
                <input class="node-input" v-model="uc.name" placeholder="用例名称" @input="onDataChange" />
                <div class="custom-select" :data-key="'uc-rel-' + uc.id">
                  <div class="select-trigger" :class="{ open: openDropdown === 'uc-rel-' + uc.id }" @click.stop="toggleDropdown('uc-rel-' + uc.id)">
                    <span>{{ uc.relation === 'association' ? '关联' : uc.relation === 'include' ? '«include»' : '«extend»' }}</span>
                    <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  <div class="select-dropdown" v-if="openDropdown === 'uc-rel-' + uc.id">
                    <div class="select-option" :class="{ selected: uc.relation === 'association' }" @click.stop="selectOption('uc-rel-' + uc.id, uc, 'relation', 'association')">
                      <span>关联</span>
                    </div>
                    <div class="select-option" :class="{ selected: uc.relation === 'include' }" @click.stop="selectOption('uc-rel-' + uc.id, uc, 'relation', 'include')">
                      <span>«include»</span>
                    </div>
                    <div class="select-option" :class="{ selected: uc.relation === 'extend' }" @click.stop="selectOption('uc-rel-' + uc.id, uc, 'relation', 'extend')">
                      <span>«extend»</span>
                    </div>
                  </div>
                </div>
                <button class="btn-node-del" @click="removeUseCase(ai, ci)" title="删除">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="editor-empty" v-else>
          <p>点击上方按钮添加参与者</p>
        </div>
        <!-- 关系连线 -->
        <div class="relation-section" v-if="actors.length > 1">
          <div class="card-title" style="margin-bottom:12px">关系连线</div>
          <div v-for="(rel, ri) in relations" :key="rel.id" class="relation-row">
            <div class="custom-select" :data-key="'rel-from-actor-' + rel.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'rel-from-actor-' + rel.id }" @click.stop="toggleDropdown('rel-from-actor-' + rel.id)">
                <span>{{ rel.fromActor ? (actors.find(a => a.id === rel.fromActor)?.name || '未命名') : '来源参与者' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'rel-from-actor-' + rel.id">
                <div class="select-option" :class="{ selected: rel.fromActor === '' }" @click.stop="selectOption('rel-from-actor-' + rel.id, rel, 'fromActor', '')">
                  <span>来源参与者</span>
                </div>
                <div v-for="a in actors" :key="a.id" class="select-option" :class="{ selected: rel.fromActor === a.id }" @click.stop="selectOption('rel-from-actor-' + rel.id, rel, 'fromActor', a.id)">
                  <span>{{ a.name || '未命名' }}</span>
                </div>
              </div>
            </div>
            <div class="custom-select" :data-key="'rel-from-case-' + rel.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'rel-from-case-' + rel.id }" @click.stop="toggleDropdown('rel-from-case-' + rel.id)">
                <span>{{ rel.fromCase ? (getCases(rel.fromActor).find(c => c.id === rel.fromCase)?.name || '未命名') : '来源用例' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'rel-from-case-' + rel.id">
                <div class="select-option" :class="{ selected: rel.fromCase === '' }" @click.stop="selectOption('rel-from-case-' + rel.id, rel, 'fromCase', '')">
                  <span>来源用例</span>
                </div>
                <div v-for="c in getCases(rel.fromActor)" :key="c.id" class="select-option" :class="{ selected: rel.fromCase === c.id }" @click.stop="selectOption('rel-from-case-' + rel.id, rel, 'fromCase', c.id)">
                  <span>{{ c.name || '未命名' }}</span>
                </div>
              </div>
            </div>
            <div class="custom-select" :data-key="'rel-type-' + rel.id" style="width:90px">
              <div class="select-trigger" :class="{ open: openDropdown === 'rel-type-' + rel.id }" @click.stop="toggleDropdown('rel-type-' + rel.id)">
                <span>{{ rel.type === 'include' ? '«include»' : rel.type === 'extend' ? '«extend»' : '泛化' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'rel-type-' + rel.id">
                <div class="select-option" :class="{ selected: rel.type === 'include' }" @click.stop="selectOption('rel-type-' + rel.id, rel, 'type', 'include')">
                  <span>«include»</span>
                </div>
                <div class="select-option" :class="{ selected: rel.type === 'extend' }" @click.stop="selectOption('rel-type-' + rel.id, rel, 'type', 'extend')">
                  <span>«extend»</span>
                </div>
                <div class="select-option" :class="{ selected: rel.type === 'generalization' }" @click.stop="selectOption('rel-type-' + rel.id, rel, 'type', 'generalization')">
                  <span>泛化</span>
                </div>
              </div>
            </div>
            <div class="custom-select" :data-key="'rel-to-actor-' + rel.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'rel-to-actor-' + rel.id }" @click.stop="toggleDropdown('rel-to-actor-' + rel.id)">
                <span>{{ rel.toActor ? (actors.find(a => a.id === rel.toActor)?.name || '未命名') : '目标参与者' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'rel-to-actor-' + rel.id">
                <div class="select-option" :class="{ selected: rel.toActor === '' }" @click.stop="selectOption('rel-to-actor-' + rel.id, rel, 'toActor', '')">
                  <span>目标参与者</span>
                </div>
                <div v-for="a in actors" :key="a.id" class="select-option" :class="{ selected: rel.toActor === a.id }" @click.stop="selectOption('rel-to-actor-' + rel.id, rel, 'toActor', a.id)">
                  <span>{{ a.name || '未命名' }}</span>
                </div>
              </div>
            </div>
            <div class="custom-select" :data-key="'rel-to-case-' + rel.id">
              <div class="select-trigger" :class="{ open: openDropdown === 'rel-to-case-' + rel.id }" @click.stop="toggleDropdown('rel-to-case-' + rel.id)">
                <span>{{ rel.toCase ? (getCases(rel.toActor).find(c => c.id === rel.toCase)?.name || '未命名') : '目标用例' }}</span>
                <svg class="arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="select-dropdown" v-if="openDropdown === 'rel-to-case-' + rel.id">
                <div class="select-option" :class="{ selected: rel.toCase === '' }" @click.stop="selectOption('rel-to-case-' + rel.id, rel, 'toCase', '')">
                  <span>目标用例</span>
                </div>
                <div v-for="c in getCases(rel.toActor)" :key="c.id" class="select-option" :class="{ selected: rel.toCase === c.id }" @click.stop="selectOption('rel-to-case-' + rel.id, rel, 'toCase', c.id)">
                  <span>{{ c.name || '未命名' }}</span>
                </div>
              </div>
            </div>
            <button class="btn-node-del" @click="removeRelation(ri)" title="删除">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button class="btn-add-relation" @click="addRelation">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            添加关系
          </button>
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div class="card preview-card" :class="{ 'has-content': hasContent }">
        <div class="preview-header">
          <div class="card-title" style="margin-bottom:0">用例图预览</div>
          <div class="preview-hint" v-if="hasContent">节点可拖拽、画布可缩放</div>
        </div>
        <div class="preview-placeholder" v-if="!hasContent">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>在左侧添加参与者和用例</p>
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
          <button class="btn-export" @click="downloadDrawio">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            导出 Draw.io
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
  () => JSON.parse(JSON.stringify({ actors: actors.value, relations: relations.value })),
  (snapshot) => {
    actors.value = snapshot.actors
    relations.value = snapshot.relations
    onDataChange()
  }
)

let _uid = 0
function uid() { return ++_uid }

// Data model
const actors = ref([])
const relations = ref([])
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

// Drag state
let _dragging = null

function addActor() {
  actors.value.push({ id: uid(), name: '', hasBoundary: false, boundaryName: '', cases: [] })
  pushHistory()
  onDataChange()
}

function removeActor(ai) {
  actors.value.splice(ai, 1)
  pushHistory()
  onDataChange()
}

function addUseCase(ai) {
  actors.value[ai].cases.push({ id: uid(), name: '', relation: 'association' })
  pushHistory()
  onDataChange()
}

function removeUseCase(ai, ci) {
  actors.value[ai].cases.splice(ci, 1)
  pushHistory()
  onDataChange()
}

function addRelation() {
  relations.value.push({ id: uid(), fromActor: '', fromCase: '', type: 'include', toActor: '', toCase: '' })
  pushHistory()
}

function removeRelation(ri) {
  relations.value.splice(ri, 1)
  pushHistory()
  onDataChange()
}

function getCases(actorId) {
  const actor = actors.value.find(a => a.id === actorId)
  return actor ? actor.cases : []
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function onDataChange() {
  nextTick(() => renderDiagram())
}

// Layout constants (shared with drawio export)
const ELLIPSE_W = 100
const ELLIPSE_H = 50
const ELLIPSE_GAP = 18
const ACTOR_X = 100
const COL_GAP = 200

// Node position map: { nodeId: { x, y } }
let _nodePositions = {}

function renderDiagram() {
  const validActors = actors.value.filter(a => a.name.trim())
  if (validActors.length === 0) {
    svgOutput.value = ''
    hasContent.value = false
    _nodePositions = {}
    return
  }

  const ellipseW = ELLIPSE_W
  const ellipseH = ELLIPSE_H
  const ellipseGap = ELLIPSE_GAP
  const actorX = ACTOR_X
  const colGap = COL_GAP

  // Layout: each actor is a column, use cases stacked vertically
  const layout = []
  let currentX = actorX

  for (const actor of validActors) {
    const validCases = actor.cases.filter(c => c.name.trim())
    const totalH = validCases.length * ellipseH + (validCases.length - 1) * ellipseGap
    const startY = 60

    const cases = validCases.map((c, i) => ({
      ...c,
      cx: currentX + colGap + ellipseW / 2,
      cy: startY + i * (ellipseH + ellipseGap) + ellipseH / 2
    }))

    layout.push({
      actor,
      x: currentX,
      centerY: startY + totalH / 2,
      cases,
      totalH,
      startY
    })

    currentX += colGap + ellipseW + 60
  }

  // Build node position map
  _nodePositions = {}
  for (const col of layout) {
    _nodePositions['actor-' + col.actor.id] = { x: col.x, y: col.centerY }
    for (const uc of col.cases) {
      _nodePositions[uc.id] = { x: uc.cx, y: uc.cy }
    }
  }

  // Calculate content bounds for viewBox
  let contentMinX = Infinity, contentMinY = Infinity, contentMaxX = -Infinity, contentMaxY = -Infinity
  for (const col of layout) {
    contentMinX = Math.min(contentMinX, col.x - 20)
    contentMaxX = Math.max(contentMaxX, col.x + 20)
    contentMinY = Math.min(contentMinY, col.centerY - 45)
    contentMaxY = Math.max(contentMaxY, col.centerY + 55)
    for (const uc of col.cases) {
      contentMinX = Math.min(contentMinX, uc.cx - ellipseW / 2)
      contentMaxX = Math.max(contentMaxX, uc.cx + ellipseW / 2)
      contentMinY = Math.min(contentMinY, uc.cy - ellipseH / 2)
      contentMaxY = Math.max(contentMaxY, uc.cy + ellipseH / 2)
    }
    if (col.actor.hasBoundary) {
      const sysPad = 30
      const sysX = col.x + colGap - ellipseW / 2 - sysPad
      const sysY = col.startY - sysPad
      contentMinX = Math.min(contentMinX, sysX)
      contentMaxX = Math.max(contentMaxX, sysX + ellipseW + sysPad * 2)
      contentMinY = Math.min(contentMinY, sysY - 20)
    }
  }

  const padX = 200
  const padY = 60
  const vbX = contentMinX - padX
  const vbY = contentMinY - padY
  const vbW = Math.max((contentMaxX - contentMinX) + padX * 2, 540)
  const vbH = Math.max((contentMaxY - contentMinY) + padY * 2, 300)

  const parts = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" style="background:#ffffff;user-select:none;font-family:'Noto Sans SC',sans-serif">`)

  // Root transform group for pan/zoom
  parts.push(`<g class="canvas-root">`)

  // System boundaries
  for (const col of layout) {
    if (col.actor.hasBoundary) {
      const sysPad = 30
      const sysX = col.x + COL_GAP - ELLIPSE_W / 2 - sysPad
      const sysY = col.startY - sysPad
      const sysW = ELLIPSE_W + sysPad * 2
      const sysH = col.totalH + sysPad * 2
      const boundaryId = 'boundary-' + col.actor.id
      _nodePositions[boundaryId] = { x: sysX, y: sysY, w: sysW, h: sysH }
      parts.push(`<g class="boundary-group" data-id="${boundaryId}" data-actor-id="${col.actor.id}">`)
      parts.push(`<rect class="boundary-rect" x="${sysX}" y="${sysY}" width="${sysW}" height="${sysH}" fill="none" stroke="#000000" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.7" style="cursor:move"/>`)
      const bName = (col.actor.boundaryName || '').trim()
      if (bName) {
        parts.push(`<text class="boundary-label" x="${sysX + sysW / 2}" y="${sysY - 8}" text-anchor="middle" font-size="14" font-weight="500" fill="#000000" style="cursor:move">${escapeXml(bName)}</text>`)
      }
      parts.push(`</g>`)
    }
  }

  // Links layer
  parts.push(`<g class="links">`)

  // Actor to Use case links
  for (const col of layout) {
    const actorPos = _nodePositions['actor-' + col.actor.id]
    const actorConnectX = actorPos.x + 22
    const actorConnectY = actorPos.y

    for (const uc of col.cases) {
      const ucPos = _nodePositions[uc.id]
      const ucConnectX = ucPos.x - ellipseW / 2
      const ucConnectY = ucPos.y

      if (uc.relation === 'association') {
        parts.push(`<g data-from="actor-${col.actor.id}" data-to="${uc.id}" class="link-group">`)
        parts.push(`<line class="link-hit-area" stroke="transparent" stroke-width="20" x1="${actorConnectX}" y1="${actorConnectY}" x2="${ucConnectX}" y2="${ucConnectY}"/>`)
        parts.push(`<line class="link-line" stroke="#000000" stroke-width="1" x1="${actorConnectX}" y1="${actorConnectY}" x2="${ucConnectX}" y2="${ucConnectY}" marker-end="url(#arrow-association)"/>`)
        parts.push(`</g>`)
      } else if (uc.relation === 'include') {
        const midX = (actorConnectX + ucConnectX) / 2
        const midY = (actorConnectY + ucConnectY) / 2
        const angle = Math.atan2(ucConnectY - actorConnectY, ucConnectX - actorConnectX) * 180 / Math.PI
        parts.push(`<g data-from="actor-${col.actor.id}" data-to="${uc.id}" class="link-group">`)
        parts.push(`<line class="link-hit-area" stroke="transparent" stroke-width="20" x1="${actorConnectX}" y1="${actorConnectY}" x2="${ucConnectX}" y2="${ucConnectY}"/>`)
        parts.push(`<line class="link-line" stroke="#000000" stroke-width="1" stroke-dasharray="5,5" x1="${actorConnectX}" y1="${actorConnectY}" x2="${ucConnectX}" y2="${ucConnectY}" marker-end="url(#arrow-include)"/>`)
        parts.push(`<g class="link-label-group" transform="translate(${midX},${midY}) rotate(${angle})">`)
        parts.push(`<rect class="label-bg" fill="#ffffff" rx="2" ry="2" x="-35" y="-10" width="70" height="20"/>`)
        parts.push(`<text text-anchor="middle" dominant-baseline="central" fill="#000000" font-size="11">&lt;&lt;include&gt;&gt;</text>`)
        parts.push(`</g>`)
        parts.push(`</g>`)
      } else if (uc.relation === 'extend') {
        const midX = (actorConnectX + ucConnectX) / 2
        const midY = (actorConnectY + ucConnectY) / 2
        const angle = Math.atan2(ucConnectY - actorConnectY, ucConnectX - actorConnectX) * 180 / Math.PI
        parts.push(`<g data-from="actor-${col.actor.id}" data-to="${uc.id}" class="link-group">`)
        parts.push(`<line class="link-hit-area" stroke="transparent" stroke-width="20" x1="${actorConnectX}" y1="${actorConnectY}" x2="${ucConnectX}" y2="${ucConnectY}"/>`)
        parts.push(`<line class="link-line" stroke="#000000" stroke-width="1" stroke-dasharray="5,5" x1="${actorConnectX}" y1="${actorConnectY}" x2="${ucConnectX}" y2="${ucConnectY}" marker-start="url(#arrow-extend-reverse)"/>`)
        parts.push(`<g class="link-label-group" transform="translate(${midX},${midY}) rotate(${angle})">`)
        parts.push(`<rect class="label-bg" fill="#ffffff" rx="2" ry="2" x="-32" y="-10" width="64" height="20"/>`)
        parts.push(`<text text-anchor="middle" dominant-baseline="central" fill="#000000" font-size="11">&lt;&lt;extend&gt;&gt;</text>`)
        parts.push(`</g>`)
        parts.push(`</g>`)
      }
    }
  }

  // Cross-actor relations
  for (const rel of relations.value) {
    const fromCol = layout.find(l => l.actor.id === rel.fromActor)
    const toCol = layout.find(l => l.actor.id === rel.toActor)
    if (!fromCol || !toCol) continue
    const fromUc = fromCol.cases.find(c => c.id === rel.fromCase)
    const toUc = toCol.cases.find(c => c.id === rel.toCase)
    if (!fromUc || !toUc) continue

    const fromPos = _nodePositions[rel.fromCase]
    const toPos = _nodePositions[rel.toCase]
    const x1 = fromPos.x + ellipseW / 2
    const y1 = fromPos.y
    const x2 = toPos.x - ellipseW / 2
    const y2 = toPos.y

    if (rel.type === 'include' || rel.type === 'extend') {
      const label = rel.type === 'include' ? '«include»' : '«extend»'
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
      const markerAttr = rel.type === 'include' ? 'marker-end="url(#arrow-include)"' : 'marker-start="url(#arrow-extend-reverse)"'
      parts.push(`<g data-from="${rel.fromCase}" data-to="${rel.toCase}" class="link-group">`)
      parts.push(`<line class="link-hit-area" stroke="transparent" stroke-width="20" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`)
      parts.push(`<line class="link-line" stroke="#000000" stroke-width="1" stroke-dasharray="5,5" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${markerAttr}/>`)
      parts.push(`<g class="link-label-group" transform="translate(${midX},${midY}) rotate(${angle})">`)
      parts.push(`<rect class="label-bg" fill="#ffffff" rx="2" ry="2" x="-35" y="-10" width="70" height="20"/>`)
      parts.push(`<text text-anchor="middle" dominant-baseline="central" fill="#000000" font-size="11">${label.replace(/«/g, '&lt;&lt;').replace(/»/g, '&gt;&gt;')}</text>`)
      parts.push(`</g>`)
      parts.push(`</g>`)
    } else if (rel.type === 'generalization') {
      parts.push(`<g data-from="${rel.fromCase}" data-to="${rel.toCase}" class="link-group">`)
      parts.push(`<line class="link-hit-area" stroke="transparent" stroke-width="20" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`)
      parts.push(`<line class="link-line" stroke="#000000" stroke-width="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#arrow-generalization)"/>`)
      parts.push(`</g>`)
    }
  }

  parts.push(`</g>`)

  // Nodes layer
  parts.push(`<g class="nodes">`)

  // Actors
  for (const col of layout) {
    const pos = _nodePositions['actor-' + col.actor.id]
    parts.push(`<g class="node-group actor-group" data-id="actor-${col.actor.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
    parts.push(`<circle r="12" cy="-25" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>`)
    parts.push(`<line x1="0" y1="-13" x2="0" y2="17" stroke="#000000" stroke-width="1.5"/>`)
    parts.push(`<line x1="-15" y1="-5" x2="15" y2="-5" stroke="#000000" stroke-width="1.5"/>`)
    parts.push(`<line x1="0" y1="17" x2="-12" y2="37" stroke="#000000" stroke-width="1.5"/>`)
    parts.push(`<line x1="0" y1="17" x2="12" y2="37" stroke="#000000" stroke-width="1.5"/>`)
    parts.push(`<text text-anchor="middle" dy="55" fill="#000000" font-size="13">${escapeXml(col.actor.name.trim())}</text>`)
    parts.push(`</g>`)
  }

  // Use cases
  for (const col of layout) {
    for (const uc of col.cases) {
      const pos = _nodePositions[uc.id]
      parts.push(`<g class="node-group usecase-group" data-id="${uc.id}" transform="translate(${pos.x},${pos.y})" style="cursor:move">`)
      parts.push(`<ellipse rx="${ellipseW / 2}" ry="${ellipseH / 2}" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>`)
      parts.push(`<text text-anchor="middle" fill="#000000" font-size="13"><tspan x="0" dy="0.35em">${escapeXml(uc.name.trim())}</tspan></text>`)
      parts.push(`</g>`)
    }
  }

  parts.push(`</g>`)

  // Arrow markers in defs
  parts.push(`<defs>`)
  parts.push(`<marker id="arrow-association" markerWidth="12" markerHeight="12" refY="6" orient="auto" refX="12"><path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#000000" stroke-width="2"/></marker>`)
  parts.push(`<marker id="arrow-include" markerWidth="12" markerHeight="12" refY="6" orient="auto" refX="12"><path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#000000" stroke-width="2"/></marker>`)
  parts.push(`<marker id="arrow-extend" markerWidth="12" markerHeight="12" refY="6" orient="auto" refX="12"><path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#000000" stroke-width="2"/></marker>`)
  parts.push(`<marker id="arrow-extend-reverse" markerWidth="12" markerHeight="12" refY="6" orient="auto" refX="0"><path d="M 10 2 L 2 6 L 10 10" fill="none" stroke="#000000" stroke-width="2"/></marker>`)
  parts.push(`<marker id="arrow-generalization" markerWidth="12" markerHeight="12" refY="6" orient="auto" refX="11"><path d="M 0 0 L 12 6 L 0 12 Z" fill="white" stroke="#000000" stroke-width="1.5"/></marker>`)
  parts.push(`</defs>`)

  parts.push(`</g>`) // close canvas-root
  parts.push('</svg>')

  _drawioLayout = layout
  svgOutput.value = parts.join('\n')
  hasContent.value = true

  nextTick(() => {
    _viewState = { panX: 0, panY: 0, zoom: 1 }
    enableDrag()
    updateAllBoundaries()
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

  // Remove old listeners if any
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
  const drag = { el, nodeId, startMouseX: e.clientX, startMouseY: e.clientY, origX: pos.x, origY: pos.y, scale }

  // If dragging a boundary, save original positions of all use cases
  if (nodeId.startsWith('boundary-')) {
    const actorId = el.getAttribute('data-actor-id')
    drag._originalUcPositions = {}
    for (const [id, p] of Object.entries(_nodePositions)) {
      if (!id.startsWith('actor-') && !id.startsWith('boundary-')) {
        // Check if this use case belongs to this actor
        const col = _drawioLayout.find(c => 'actor-' + c.actor.id === actorId)
        if (col && col.cases.some(uc => uc.id === id)) {
          drag._originalUcPositions[id] = { x: p.x, y: p.y }
        }
      }
    }
  }

  _nodeDrag = drag
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
    _nodePositions[_nodeDrag.nodeId] = { x: newX, y: newY }
    _nodeDrag.el.setAttribute('transform', `translate(${newX},${newY})`)

    // If dragging a boundary, also move all use cases inside it
    if (_nodeDrag.nodeId.startsWith('boundary-')) {
      const actorId = _nodeDrag.el.getAttribute('data-actor-id')
      const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
      if (svg && actorId) {
        const ucNodes = svg.querySelectorAll('.usecase-group')
        ucNodes.forEach(node => {
          const ucId = node.getAttribute('data-id')
          const origPos = _nodeDrag._originalUcPositions?.[ucId]
          if (origPos) {
            _nodePositions[ucId] = { x: origPos.x + dx, y: origPos.y + dy }
            node.setAttribute('transform', `translate(${origPos.x + dx},${origPos.y + dy})`)
          }
        })
      }
    }

    updateAllLines()
    updateAllBoundaries()
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
  if (_nodeDrag) {
    const nodeId = _nodeDrag.nodeId
    const pos = _nodePositions[nodeId]
    if (pos) {
      for (const col of _drawioLayout) {
        if (nodeId === 'actor-' + col.actor.id) {
          col.x = pos.x
          col.centerY = pos.y
        }
        for (const uc of col.cases) {
          if (nodeId === uc.id) {
            uc.cx = pos.x
            uc.cy = pos.y
          }
        }
      }
    }
  }
  _nodeDrag = null; _panDrag = null
}

function updateAllLines() {
  const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
  if (!svg) return

  const linkGroups = svg.querySelectorAll('.link-group')
  linkGroups.forEach(group => {
    const fromId = group.getAttribute('data-from')
    const toId = group.getAttribute('data-to')
    const fromPos = _nodePositions[fromId]
    const toPos = _nodePositions[toId]
    if (!fromPos || !toPos) return

    let x1, y1, x2, y2
    if (fromId.startsWith('actor-')) {
      x1 = fromPos.x + 22
      y1 = fromPos.y
    } else {
      x1 = fromPos.x + ELLIPSE_W / 2
      y1 = fromPos.y
    }
    if (toId.startsWith('actor-')) {
      x2 = toPos.x + 22
      y2 = toPos.y
    } else {
      x2 = toPos.x - ELLIPSE_W / 2
      y2 = toPos.y
    }

    const hitArea = group.querySelector('.link-hit-area')
    const line = group.querySelector('.link-line')
    if (hitArea) {
      hitArea.setAttribute('x1', x1); hitArea.setAttribute('y1', y1)
      hitArea.setAttribute('x2', x2); hitArea.setAttribute('y2', y2)
    }
    if (line) {
      line.setAttribute('x1', x1); line.setAttribute('y1', y1)
      line.setAttribute('x2', x2); line.setAttribute('y2', y2)
    }

    const labelGroup = group.querySelector('.link-label-group')
    if (labelGroup) {
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
      labelGroup.setAttribute('transform', `translate(${midX},${midY}) rotate(${angle})`)
    }
  })

  // Update boundaries to fit their use cases
  const sysPad = 30
  const allBoundaryGroups = svg.querySelectorAll('[data-id^="boundary-"]')
  allBoundaryGroups.forEach(group => {
    const actorId = group.getAttribute('data-actor-id')
    const col = _drawioLayout.find(c => 'actor-' + c.actor.id === actorId)
    if (!col) return

    // Find all use case positions for this actor
    const ucPositions = col.cases.map(uc => _nodePositions[uc.id]).filter(Boolean)
    if (ucPositions.length === 0) return

    // Calculate bounding box of all use cases
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of ucPositions) {
      minX = Math.min(minX, p.x - ELLIPSE_W / 2)
      maxX = Math.max(maxX, p.x + ELLIPSE_W / 2)
      minY = Math.min(minY, p.y - ELLIPSE_H / 2)
      maxY = Math.max(maxY, p.y + ELLIPSE_H / 2)
    }

    const newX = minX - sysPad
    const newY = minY - sysPad
    const newW = (maxX - minX) + sysPad * 2
    const newH = (maxY - minY) + sysPad * 2

    const rect = group.querySelector('.boundary-rect')
    const label = group.querySelector('.boundary-label')
    if (rect) {
      rect.setAttribute('x', newX)
      rect.setAttribute('y', newY)
      rect.setAttribute('width', newW)
      rect.setAttribute('height', newH)
    }
    if (label) {
      const bName = (col.actor.boundaryName || '').trim()
      if (bName) {
        label.textContent = bName
        label.setAttribute('x', newX + newW / 2)
        label.setAttribute('y', newY - 8)
        label.style.display = ''
      } else {
        label.style.display = 'none'
      }
    }

    // Update stored position
    const boundaryId = 'boundary-' + col.actor.id
    _nodePositions[boundaryId] = { x: newX, y: newY, w: newW, h: newH }
  })
}

function updateAllBoundaries() {
  const svg = graphRef.value ? graphRef.value.querySelector('svg') : null
  if (!svg) return
  const sysPad = 30

  for (const col of _drawioLayout) {
    if (!col.actor.hasBoundary) continue
    const boundaryId = 'boundary-' + col.actor.id
    const boundaryEl = svg.querySelector('[data-id="' + boundaryId + '"]')
    if (!boundaryEl) continue

    const ucPositions = col.cases.map(uc => _nodePositions[uc.id]).filter(Boolean)
    if (ucPositions.length === 0) continue

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of ucPositions) {
      minX = Math.min(minX, p.x - ELLIPSE_W / 2)
      maxX = Math.max(maxX, p.x + ELLIPSE_W / 2)
      minY = Math.min(minY, p.y - ELLIPSE_H / 2)
      maxY = Math.max(maxY, p.y + ELLIPSE_H / 2)
    }

    const newX = minX - sysPad
    const newY = minY - sysPad
    const newW = (maxX - minX) + sysPad * 2
    const newH = (maxY - minY) + sysPad * 2

    const rect = boundaryEl.querySelector('rect')
    const label = boundaryEl.querySelector('text')
    if (rect) {
      rect.setAttribute('x', newX)
      rect.setAttribute('y', newY)
      rect.setAttribute('width', newW)
      rect.setAttribute('height', newH)
    }
    if (label) {
      label.setAttribute('x', newX + newW / 2)
      label.setAttribute('y', newY - 8)
    }
    _nodePositions[boundaryId] = { x: newX, y: newY, w: newW, h: newH }
  }
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
  a.href = url; a.download = 'use-case-diagram.svg'; a.click()
  URL.revokeObjectURL(url)
  toastRef.value?.show('已下载 SVG', 'success')
}

async function downloadPNG() {
  if (!svgOutput.value || !graphRef.value) return
  const svgEl = graphRef.value.querySelector('svg')
  if (!svgEl) return

  // Clone SVG and set explicit dimensions for canvas rendering
  const clone = svgEl.cloneNode(true)
  const vb = svgEl.viewBox.baseVal
  const w = vb.width || 800
  const h = vb.height || 600
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)
  clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${w} ${h}`)

  const svgData = new XMLSerializer().serializeToString(clone)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
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
    canvas.toBlob(blob => {
      const pngUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = pngUrl; a.download = 'use-case-diagram.png'; a.click()
      URL.revokeObjectURL(pngUrl)
      URL.revokeObjectURL(url)
      toastRef.value?.show('已下载 PNG', 'success')
    }, 'image/png')
  }
  img.src = url
}

// Save layout data for drawio export
let _drawioLayout = []

function downloadDrawio() {
  if (_drawioLayout.length === 0) return
  let cellId = 0
  const gid = () => 'uc' + (++cellId)

  // Build cell map: actor id -> cell id, case id -> cell id
  const cellMap = {}
  const cells = []

  // Actors
  for (const col of _drawioLayout) {
    const actorId = gid()
    cellMap['actor-' + col.actor.id] = actorId
    cells.push(`        <mxCell id="${actorId}" parent="1" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" value="${escapeXml(col.actor.name.trim())}" vertex="1">
          <mxGeometry height="90" width="40" x="${col.x - 20}" y="${col.centerY - 45}" as="geometry" />
        </mxCell>`)
  }

  // Use cases
  for (const col of _drawioLayout) {
    for (const uc of col.cases) {
      const ucId = gid()
      cellMap[uc.id] = ucId
      cells.push(`        <mxCell id="${ucId}" parent="1" style="ellipse;whiteSpace=wrap;html=1;" value="${escapeXml(uc.name.trim())}" vertex="1">
          <mxGeometry height="${ELLIPSE_H}" width="${ELLIPSE_W}" x="${uc.cx - ELLIPSE_W / 2}" y="${uc.cy - ELLIPSE_H / 2}" as="geometry" />
        </mxCell>`)
    }
  }

  // Edges
  for (const col of _drawioLayout) {
    const actorCellId = cellMap['actor-' + col.actor.id]
    for (const uc of col.cases) {
      const ucCellId = cellMap[uc.id]
      if (!actorCellId || !ucCellId) continue

      if (uc.relation === 'association') {
        cells.push(`        <mxCell id="${gid()}" edge="1" parent="1" source="${actorCellId}" style="rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" target="${ucCellId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`)
      } else if (uc.relation === 'include') {
        const edgeId = gid()
        cells.push(`        <mxCell id="${edgeId}" edge="1" parent="1" source="${actorCellId}" style="rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;endArrow=open;endFill=0;" target="${ucCellId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`)
        cells.push(`        <mxCell id="${gid()}" connectable="0" parent="${edgeId}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;&lt;include&gt;&gt;" vertex="1">
          <mxGeometry relative="1" x="-0.1" y="1" as="geometry">
            <mxPoint as="offset" />
          </mxGeometry>
        </mxCell>`)
      } else if (uc.relation === 'extend') {
        const edgeId = gid()
        cells.push(`        <mxCell id="${edgeId}" edge="1" parent="1" source="${actorCellId}" style="rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;endArrow=none;endFill=0;startArrow=open;startFill=0;" target="${ucCellId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`)
        cells.push(`        <mxCell id="${gid()}" connectable="0" parent="${edgeId}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;&lt;extend&gt;&gt;" vertex="1">
          <mxGeometry relative="1" x="0.1" as="geometry">
            <mxPoint as="offset" />
          </mxGeometry>
        </mxCell>`)
      }
    }
  }

  // System boundaries
  for (const col of _drawioLayout) {
    if (col.actor.hasBoundary) {
      const sysPad = 30
      const sysX = col.x + COL_GAP - ELLIPSE_W / 2 - sysPad
      const sysY = col.startY - sysPad
      const sysW = ELLIPSE_W + sysPad * 2
      const sysH = col.totalH + sysPad * 2
      const bName = (col.actor.boundaryName || '').trim()
      cells.push(`        <mxCell id="${gid()}" parent="1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;dashed=0;" value="${escapeXml(bName)}" vertex="1">
          <mxGeometry height="${sysH}" width="${sysW}" x="${sysX}" y="${sysY - 20}" as="geometry" />
        </mxCell>`)
    }
  }

  const xml = `<mxfile host="app" version="29.3.0">
  <diagram name="用例图" id="usecase1">
    <mxGraphModel dx="1181" dy="710" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`

  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'use-case-diagram.drawio'; a.click()
  URL.revokeObjectURL(url)
  toastRef.value?.show('已导出 Draw.io 文件', 'success')
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
.tree { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.tree-actor { border: 1px solid var(--border); border-radius: var(--radius); }
.actor-node { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg-input); }
.tree-children { padding: 6px 0 6px 28px; display: flex; flex-direction: column; gap: 4px; }
.case-node { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius); background: var(--bg-card); border: 1px solid transparent; transition: border-color 0.15s; }
.case-node:hover { border-color: var(--border); }
.node-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--text-muted); }
.actor-icon { color: var(--accent); }
.node-input { flex: 1; min-width: 0; padding: 5px 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; outline: none; transition: border-color 0.15s; }
.node-input:focus { border-color: var(--accent); }
.node-input::placeholder { color: var(--text-muted); }
.boundary-name-input { flex: none !important; width: 120px !important; }
.node-select { width: 100px; padding: 5px 6px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.78rem; outline: none; cursor: pointer; }
.node-select:focus { border-color: var(--accent); }

/* Custom dropdown */
.custom-select { position: relative; }
.select-trigger { display: flex; align-items: center; justify-content: center; padding: 5px 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.78rem; cursor: pointer; min-width: 80px; user-select: none; transition: border-color 0.15s; text-align: center; }
.select-trigger:hover, .select-trigger.open { border-color: var(--accent); }
.select-trigger .arrow { transition: transform 0.2s; }
.select-trigger.open .arrow { transform: rotate(180deg); }
.select-dropdown { position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 100; overflow: hidden; }
.select-option { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 10px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer; transition: background 0.1s; text-align: center; }
.select-option:hover { background: var(--accent-dim); color: var(--text-primary); }
.select-option.selected { color: var(--accent); }
.boundary-check { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--text-muted); cursor: pointer; flex-shrink: 0; }
.boundary-check input { accent-color: var(--accent); }
.btn-node-add { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1px dashed var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.btn-node-add:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.btn-node-del { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.btn-node-del:hover { background: rgba(248,113,113,0.15); color: var(--error); }
.editor-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.9rem; }

/* Relations */
.relation-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.relation-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.btn-add-relation { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px dashed var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); font-family: 'Noto Sans SC', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.btn-add-relation:hover { border-color: var(--accent); color: var(--accent); }

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
