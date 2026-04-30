<template>
  <div class="card preview-card" :class="{ 'has-content': diagrams.length > 0 }">
    <div class="preview-header">
      <div class="card-title" style="margin-bottom:0">预览</div>
    </div>
    <div class="tab-bar" :class="{ visible: diagrams.length > 1 }">
      <div v-for="(d, i) in diagrams" :key="i" :class="['tab-item', { active: i === activeIndex }]" @click="switchTab(i)">{{ d.tableDisplay }}</div>
    </div>
    <div class="preview-placeholder" v-if="diagrams.length === 0">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <p>在左侧输入 SQL 语句后点击生成</p>
    </div>
    <div class="graph-container" v-show="diagrams.length > 0" ref="graphContainerRef" v-html="currentSvg"></div>
    <div class="export-row" :class="{ visible: diagrams.length > 0 }">
      <button class="btn-export" @click="handleExportDrawio">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        下载 .drawio
      </button>
      <button class="btn-export" @click="handleExportPNG">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        下载 PNG
      </button>
      <button class="btn-export" @click="handleExportSVG">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        下载 SVG
      </button>
      <div class="batch-wrapper" :class="{ visible: diagrams.length > 1 }">
        <button class="btn-export-all" @click="showBatchMenu = !showBatchMenu">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          批量下载全部
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="batch-menu" :class="{ visible: showBatchMenu }">
          <div class="batch-menu-item" @click="batchExport('drawio')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            全部下载 .drawio
          </div>
          <div class="batch-menu-item" @click="batchExport('png')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            全部下载 PNG
          </div>
          <div class="batch-menu-item" @click="batchExport('svg')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            全部下载 SVG
          </div>
          <div class="batch-menu-divider"></div>
          <div class="batch-menu-item" @click="batchExport('zip')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            全部下载所有格式
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { drawioToSvg } from '../utils/diagram.js'
import { exportPNG, exportSVG, exportDrawio, exportAll, exportAllDrawio, exportAllPNG, exportAllSVG } from '../utils/export.js'

const props = defineProps({ diagrams: { type: Array, default: () => [] }, activeIndex: { type: Number, default: 0 } })
const emit = defineEmits(['update:activeIndex', 'update:info'])

const graphContainerRef = ref(null)
const currentSvg = ref('')
const showBatchMenu = ref(false)

const _cache = {}
let _activeDiagram = null
let _elementDrag = null
let _panDrag = null
let _dragInitialized = false

function switchTab(idx) {
  emit('update:activeIndex', idx)
}

watch(() => props.diagrams, () => {
  // Clear cache when diagrams change (new generation)
  for (const key in _cache) delete _cache[key]
  _dragInitialized = false
  _activeDiagram = null
  if (props.diagrams.length > 0) {
    renderDiagram()
  } else {
    currentSvg.value = ''
  }
})

watch(() => props.activeIndex, () => {
  if (props.diagrams.length > 0) {
    renderDiagram()
  }
})

function renderDiagram() {
  const d = props.diagrams[props.activeIndex]
  if (!d || !d.xml) return

  const key = props.activeIndex
  if (!_cache[key]) {
    const { svgString, diagramData } = drawioToSvg(d.xml)
    _cache[key] = { svgString, diagramData, viewState: { panX: 0, panY: 0, zoom: 1 } }
  }

  const cache = _cache[key]
  currentSvg.value = cache.svgString

  nextTick(() => {
    const container = graphContainerRef.value
    const svg = container ? container.querySelector('svg') : null
    if (!svg) return

    // Reset pan/zoom state
    cache.viewState = { panX: 0, panY: 0, zoom: 1 }

    // Use xMidYMid meet: scale proportionally, center content, no stretching
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.style.width = '100%'
    svg.style.height = '100%'

    // Store original viewBox for zoom/pan reference
    const vb = svg.viewBox.baseVal
    cache.origViewBox = { x: vb.x, y: vb.y, w: vb.width, h: vb.height }

    _activeDiagram = { ...d, diagramData: cache.diagramData, svgString: cache.svgString, viewState: cache.viewState }
    enableDrag()

    emit('update:info', {
      tableName: d.tableName,
      tableDisplay: d.tableDisplay,
      fieldCount: d.columns ? d.columns.length : 0,
      fields: d.columns ? d.columns.map(c => c.display) : []
    })
  })
}

function applyViewTransform() {
  const diagram = _activeDiagram
  if (!diagram) return
  const container = graphContainerRef.value
  const svg = container ? container.querySelector('svg') : null
  if (!svg) return

  const cache = _cache[props.activeIndex]
  if (!cache || !cache.origViewBox) return

  const vs = diagram.viewState
  const orig = cache.origViewBox
  const vbW = orig.w / vs.zoom
  const vbH = orig.h / vs.zoom
  const newX = (orig.w - vbW) / 2 + vs.panX
  const newY = (orig.h - vbH) / 2 + vs.panY

  svg.setAttribute('viewBox', (orig.x + newX) + ' ' + (orig.y + newY) + ' ' + vbW + ' ' + vbH)
}

function enableDrag() {
  const container = graphContainerRef.value
  if (!container || !_activeDiagram || !_activeDiagram.diagramData) return
  if (_dragInitialized) return
  _dragInitialized = true

  container.addEventListener('mousedown', onElementMouseDown)
  container.addEventListener('mousedown', onPanMouseDown)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  container.addEventListener('wheel', onWheel, { passive: false })
}

function onElementMouseDown(e) {
  const diagram = _activeDiagram
  if (!diagram || !diagram.diagramData) return
  const container = graphContainerRef.value
  const svg = container.querySelector('svg')
  if (!svg) return
  const g = e.target.closest('.draggable')
  if (!g) return
  e.preventDefault(); e.stopPropagation()
  const cellId = g.getAttribute('data-cell-id')
  const cell = diagram.diagramData.cellMap[cellId]
  if (!cell) return
  // Only allow dragging field nodes (ellipses), not the root table node (rectangle)
  if (cell.style.indexOf('ellipse') < 0) return
  const svgRect = svg.getBoundingClientRect()
  const vb = svg.viewBox.baseVal
  const scaleX = vb.width / svgRect.width
  const scaleY = vb.height / svgRect.height
  _elementDrag = { cell, g, startMouseX: e.clientX, startMouseY: e.clientY, startCellX: cell.x, startCellY: cell.y, scaleX, scaleY }
}

function onPanMouseDown(e) {
  const diagram = _activeDiagram
  if (!diagram || _elementDrag || e.target.closest('.draggable')) return
  e.preventDefault()
  _panDrag = { startMouseX: e.clientX, startMouseY: e.clientY, startPanX: diagram.viewState.panX, startPanY: diagram.viewState.panY }
  graphContainerRef.value.style.cursor = 'grabbing'
}

function onMouseMove(e) {
  const diagram = _activeDiagram
  if (!diagram) return
  const container = graphContainerRef.value
  const svg = container.querySelector('svg')
  if (!svg) return
  if (_elementDrag) {
    e.preventDefault()
    const dx = (e.clientX - _elementDrag.startMouseX) * _elementDrag.scaleX
    const dy = (e.clientY - _elementDrag.startMouseY) * _elementDrag.scaleY
    _elementDrag.cell.x = _elementDrag.startCellX + dx
    _elementDrag.cell.y = _elementDrag.startCellY + dy
    _elementDrag.g.setAttribute('transform', 'translate(' + dx + ',' + dy + ')')
    const d = diagram.diagramData
    const lines = svg.querySelectorAll('.edge-line')
    lines.forEach(line => {
      const src = d.cellMap[line.getAttribute('data-source')]
      const tgt = d.cellMap[line.getAttribute('data-target')]
      if (!src || !tgt) return
      line.setAttribute('x1', src.x + src.w / 2 + d.offsetX)
      line.setAttribute('y1', src.y + src.h / 2 + d.offsetY)
      line.setAttribute('x2', tgt.x + tgt.w / 2 + d.offsetX)
      line.setAttribute('y2', tgt.y + tgt.h / 2 + d.offsetY)
    })
  } else if (_panDrag) {
    e.preventDefault()
    const svgRect = svg.getBoundingClientRect()
    const vb = svg.viewBox.baseVal
    const scaleX = vb.width / svgRect.width
    const scaleY = vb.height / svgRect.height
    const dx = (e.clientX - _panDrag.startMouseX) * scaleX
    const dy = (e.clientY - _panDrag.startMouseY) * scaleY
    diagram.viewState.panX = _panDrag.startPanX - dx
    diagram.viewState.panY = _panDrag.startPanY - dy
    applyViewTransform()
  }
}

function onMouseUp() {
  if (_panDrag) graphContainerRef.value.style.cursor = ''
  _elementDrag = null; _panDrag = null
}

function onWheel(e) {
  const diagram = _activeDiagram
  if (!diagram) return
  const container = graphContainerRef.value
  const svg = container.querySelector('svg')
  if (!svg) return
  e.preventDefault()

  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const oldZoom = diagram.viewState.zoom
  let newZoom = oldZoom * delta
  newZoom = Math.max(0.3, Math.min(5, newZoom))

  const svgRect = svg.getBoundingClientRect()
  const mouseX = e.clientX - svgRect.left
  const mouseY = e.clientY - svgRect.top

  const vb = svg.viewBox.baseVal
  const cx = vb.x + (mouseX / svgRect.width) * vb.width
  const cy = vb.y + (mouseY / svgRect.height) * vb.height

  diagram.viewState.zoom = newZoom

  // Scale viewBox around the point under mouse
  const ratio = oldZoom / newZoom
  const newVbW = vb.width * ratio
  const newVbH = vb.height * ratio
  const newVbX = cx - (cx - vb.x) * ratio
  const newVbY = cy - (cy - vb.y) * ratio

  svg.setAttribute('viewBox', newVbX + ' ' + newVbY + ' ' + newVbW + ' ' + newVbH)

  // Recalculate panX/panY to keep state consistent
  const origVb = _cache[props.activeIndex] ? (() => {
    const { svgString } = _cache[props.activeIndex]
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'text/xml')
    const svgEl = doc.querySelector('svg')
    return svgEl ? svgEl.viewBox.baseVal : null
  })() : null
  if (origVb) {
    const origW = origVb.width
    const origH = origVb.height
    const expectedW = origW / newZoom
    const expectedH = origH / newZoom
    diagram.viewState.panX = newVbX - (origVb.x + (origW - expectedW) / 2)
    diagram.viewState.panY = newVbY - (origVb.y + (origH - expectedH) / 2)
  }
}

function handleExportDrawio() {
  const d = props.diagrams[props.activeIndex]
  if (d) { exportDrawio(d, d.fileName); emit('toast', '已下载 ' + d.fileName + '.drawio', 'success') }
}
function handleExportPNG() {
  const d = props.diagrams[props.activeIndex]
  const cache = _cache[props.activeIndex]
  if (cache) { exportPNG({ ...d, diagramData: cache.diagramData }, d.fileName); emit('toast', '已下载 PNG', 'success') }
}
function handleExportSVG() {
  const d = props.diagrams[props.activeIndex]
  const cache = _cache[props.activeIndex]
  if (cache) { exportSVG({ svgString: cache.svgString }, d.fileName); emit('toast', '已下载 SVG', 'success') }
}
function getItems() {
  // Ensure all diagrams are cached (not just the active tab)
  props.diagrams.forEach((d, i) => {
    if (!_cache[i] && d.xml) {
      const { svgString, diagramData } = drawioToSvg(d.xml)
      _cache[i] = { svgString, diagramData, viewState: { panX: 0, panY: 0, zoom: 1 } }
    }
  })
  return props.diagrams.map((d, i) => {
    const c = _cache[i]
    return c ? { ...d, diagramData: c.diagramData, svgString: c.svgString } : d
  })
}

function batchExport(format) {
  showBatchMenu.value = false
  const items = getItems()
  if (format === 'drawio') {
    exportAllDrawio(items)
    emit('toast', '已下载全部 .drawio (ZIP)', 'success')
  } else if (format === 'png') {
    exportAllPNG(items)
    emit('toast', '已下载全部 PNG (ZIP)', 'success')
  } else if (format === 'svg') {
    exportAllSVG(items)
    emit('toast', '已下载全部 SVG (ZIP)', 'success')
  } else if (format === 'zip') {
    exportAll(items)
    emit('toast', '已下载全部图表 (ZIP)', 'success')
  }
}

// Close menu when clicking outside
function onDocumentClick(e) {
  if (showBatchMenu.value && !e.target.closest('.batch-menu') && !e.target.closest('.btn-export-all')) {
    showBatchMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  _dragInitialized = false
  _activeDiagram = null
})
</script>
<style scoped>
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.preview-card { display: flex; flex-direction: column; min-height: 380px; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }
.tab-bar { display: none; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
.tab-bar.visible { display: flex; }
.tab-item { padding: 7px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); background: var(--bg-input); border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.tab-item:hover { color: var(--text-primary); border-color: var(--text-muted); }
.tab-item.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }
.preview-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 16px; min-height: 200px; }
.preview-placeholder svg { opacity: 0.3; }
.preview-placeholder p { font-size: 0.9rem; }
.graph-container { background: #ffffff; border-radius: var(--radius); overflow: hidden; position: relative; flex: 1; min-height: 200px; }
.graph-container :deep(svg) { display: block; }
.export-row { display: none; gap: 10px; margin-top: 16px; }
.export-row.visible { display: flex; }
.btn-export { flex: 1; padding: 11px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-input); color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-export:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.btn-export-all { flex: 1; padding: 11px 16px; border: 1px solid var(--accent); border-radius: var(--radius); background: var(--accent-dim); color: var(--accent); font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-export-all:hover { background: var(--accent); color: #0f1117; }
.batch-wrapper { display: none; flex: 1; position: relative; }
.batch-wrapper.visible { display: flex; }
.batch-menu { display: none; position: absolute; bottom: calc(100% + 8px); right: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); z-index: 100; min-width: 180px; overflow: hidden; }
.batch-menu.visible { display: block; animation: menuFadeIn 0.15s ease; }
.batch-menu-item { padding: 10px 16px; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s; font-family: 'Noto Sans SC', sans-serif; }
.batch-menu-item:hover { background: var(--accent-dim); color: var(--accent); }
.batch-menu-divider { height: 1px; background: var(--border); margin: 4px 0; }
@keyframes menuFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
