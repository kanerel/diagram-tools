<template>
  <div class="page">
    <header class="header">
      <h1>SQL <span>to</span> ER Diagram</h1>
      <p>输入一条或多条 CREATE TABLE 语句，自动生成实体关系图</p>
    </header>
    <div class="main-grid">
      <div class="left-panel">
        <SqlInput :error-msg="errorMsg" @generate="generateER" @clear="clearAll" />
        <InfoPanel :visible="!!activeDiagram" :table-name="info.tableName" :field-count="info.fieldCount" :fields="info.fields" />
      </div>
      <DiagramPreview :diagrams="diagrams" :active-index="activeIndex" @update:active-index="val => activeIndex = val" @update:info="val => info = val" @toast="showToast" />
    </div>
    <Toast ref="toastRef" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
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

const activeDiagram = computed(() => diagrams.value[activeIndex.value] || null)

function showToast(msg, type = 'success') {
  toastRef.value?.show(msg, type)
}

function generateER(sql) {
  errorMsg.value = ''
  if (!sql.trim()) { errorMsg.value = '请输入 SQL 语句'; return }
  const statements = splitCreateTables(sql)
  if (statements.length === 0) { errorMsg.value = '未找到有效的 CREATE TABLE 语句'; return }
  const newDiagrams = []
  for (const stmt of statements) {
    const parsed = parseCreateTable(stmt)
    const fieldCount = parsed.columns.length
    if (fieldCount < 1) {
      errorMsg.value = '表 "' + parsed.tableName + '" 没有字段'
      return
    }
    const xml = generateDiagramXml(parsed.tableDisplay, parsed.columns)
    const fileName = parsed.tableComment ? (parsed.tableComment + '-' + parsed.tableName) : parsed.tableName
    newDiagrams.push({ ...parsed, fileName, xml, svgString: null, diagramData: null, origViewBox: null, viewState: null })
  }
  diagrams.value = newDiagrams
  activeIndex.value = 0
  showToast('成功生成 ' + newDiagrams.length + ' 个 ER 图', 'success')
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
</style>
