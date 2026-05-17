<template>
  <div class="page">
    <header class="header">
      <h1><span>SQL</span> to <span>ER</span> Diagram</h1>
      <p>输入一条或多条 CREATE TABLE 语句，自动生成实体关系图</p>
    </header>
    <div class="main-grid" :class="{ stretched: diagrams.length === 0 }">
      <div class="left-panel">
        <SqlInput :error-msg="errorMsg" @generate="generateER" @clear="clearAll" />
        <div class="style-panel" v-if="diagrams.length > 0">
          <div class="style-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            样式调整
          </div>
          <div class="style-sliders">
            <div class="slider-row">
              <label>矩形宽度</label>
              <input type="range" min="120" max="300" v-model.number="styleOpts.rectW" @input="onStyleChange" />
              <span class="slider-val">{{ styleOpts.rectW }}</span>
            </div>
            <div class="slider-row">
              <label>矩形高度</label>
              <input type="range" min="30" max="100" v-model.number="styleOpts.rectH" @input="onStyleChange" />
              <span class="slider-val">{{ styleOpts.rectH }}</span>
            </div>
            <div class="slider-row">
              <label>椭圆宽度</label>
              <input type="range" min="80" max="240" v-model.number="styleOpts.ellipseW" @input="onStyleChange" />
              <span class="slider-val">{{ styleOpts.ellipseW }}</span>
            </div>
            <div class="slider-row">
              <label>椭圆高度</label>
              <input type="range" min="30" max="120" v-model.number="styleOpts.ellipseH" @input="onStyleChange" />
              <span class="slider-val">{{ styleOpts.ellipseH }}</span>
            </div>
            <div class="slider-row">
              <label>连线长度</label>
              <input type="range" min="50" max="200" v-model.number="styleOpts.radiusFactor" @input="onStyleChange" />
              <span class="slider-val">{{ styleOpts.radiusFactor }}%</span>
            </div>
            <div class="slider-row">
              <label>字体大小</label>
              <input type="range" min="10" max="36" v-model.number="styleOpts.fontSize" @input="onStyleChange" />
              <span class="slider-val">{{ styleOpts.fontSize }}</span>
            </div>
          </div>
          <button class="btn-reset" @click="resetStyle">恢复默认</button>
        </div>
        <InfoPanel :visible="!!activeDiagram" :table-name="info.tableName" :field-count="info.fieldCount" :fields="info.fields" />
      </div>
      <DiagramPreview :diagrams="diagrams" :active-index="activeIndex" @update:active-index="val => activeIndex = val" @update:info="val => info = val" @toast="showToast" />
    </div>
    <Toast ref="toastRef" />
  </div>
</template>
<script setup>
import { ref, computed, reactive } from 'vue'
import SqlInput from '../components/SqlInput.vue'
import InfoPanel from '../components/InfoPanel.vue'
import DiagramPreview from '../components/DiagramPreview.vue'
import Toast from '../components/Toast.vue'
import { splitCreateTables, parseCreateTable } from '../utils/sqlParser.js'
import { generateDiagramXml } from '../utils/diagramGenerator.js'

const diagrams = ref([])
const activeIndex = ref(0)
const errorMsg = ref('')
const info = ref({ tableName: '-', fieldCount: 0, fields: [] })
const toastRef = ref(null)

const DEFAULT_STYLE = { rectW: 180, rectH: 50, ellipseW: 140, ellipseH: 60, radiusFactor: 100, fontSize: 20 }
const styleOpts = reactive({ ...DEFAULT_STYLE })
let _parsedStatements = []

const activeDiagram = computed(() => diagrams.value[activeIndex.value] || null)

function showToast(msg, type = 'success') {
  toastRef.value?.show(msg, type)
}

function generateER(sql) {
  errorMsg.value = ''
  if (!sql.trim()) { errorMsg.value = '请输入 SQL 语句'; return }
  const statements = splitCreateTables(sql)
  if (statements.length === 0) { errorMsg.value = '未找到有效的 CREATE TABLE 语句'; return }
  _parsedStatements = []
  const newDiagrams = []
  for (const stmt of statements) {
    const parsed = parseCreateTable(stmt)
    const fieldCount = parsed.columns.length
    if (fieldCount < 1) {
      errorMsg.value = '表 "' + parsed.tableName + '" 没有字段'
      return
    }
    _parsedStatements.push(parsed)
    const opts = buildOpts()
    const xml = generateDiagramXml(parsed.tableDisplay, parsed.columns, opts)
    const fileName = parsed.tableComment ? (parsed.tableComment + '-' + parsed.tableName) : parsed.tableName
    newDiagrams.push({ ...parsed, fileName, xml, svgString: null, diagramData: null, origViewBox: null, viewState: null })
  }
  diagrams.value = newDiagrams
  activeIndex.value = 0
  showToast('成功生成 ' + newDiagrams.length + ' 个 ER 图', 'success')
}

function buildOpts() {
  return {
    rectW: styleOpts.rectW,
    rectH: styleOpts.rectH,
    ellipseW: styleOpts.ellipseW,
    ellipseH: styleOpts.ellipseH,
    radiusFactor: styleOpts.radiusFactor / 100,
    fontSize: styleOpts.fontSize
  }
}

let _styleTimer = null
function onStyleChange() {
  clearTimeout(_styleTimer)
  _styleTimer = setTimeout(() => {
    if (_parsedStatements.length === 0) return
    const opts = buildOpts()
    const newDiagrams = []
    for (const parsed of _parsedStatements) {
      const xml = generateDiagramXml(parsed.tableDisplay, parsed.columns, opts)
      const fileName = parsed.tableComment ? (parsed.tableComment + '-' + parsed.tableName) : parsed.tableName
      newDiagrams.push({ ...parsed, fileName, xml, svgString: null, diagramData: null, origViewBox: null, viewState: null })
    }
    diagrams.value = newDiagrams
    activeIndex.value = 0
  }, 200)
}

function resetStyle() {
  Object.assign(styleOpts, DEFAULT_STYLE)
  onStyleChange()
}

function clearAll() {
  diagrams.value = []
  activeIndex.value = 0
  errorMsg.value = ''
  info.value = { tableName: '-', fieldCount: 0, fields: [] }
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
.style-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; margin-top: 16px; box-shadow: var(--shadow); }
.style-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.style-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }
.style-sliders { display: flex; flex-direction: column; gap: 10px; }
.slider-row { display: flex; align-items: center; gap: 10px; }
.slider-row label { font-size: 0.82rem; color: var(--text-secondary); width: 70px; flex-shrink: 0; }
.slider-row input[type="range"] { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: var(--border); border-radius: 2px; outline: none; cursor: pointer; }
.slider-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; }
.slider-val { font-size: 0.78rem; color: var(--text-muted); width: 40px; text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.btn-reset { margin-top: 12px; width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-input); color: var(--text-secondary); font-family: 'Noto Sans SC', sans-serif; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
.btn-reset:hover { border-color: var(--accent); color: var(--accent); }
</style>
