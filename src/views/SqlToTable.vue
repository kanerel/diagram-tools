<template>
  <div class="page">
    <header class="header">
      <h1><span>SQL</span> to <span>Table</span></h1>
      <p>输入 SQL CREATE TABLE 语句，自动生成学术三线表，支持导出 PNG / Word / Excel</p>
    </header>
    <div class="main-grid" :class="{ stretched: tables.length === 0 }">
      <div class="left-panel">
        <SqlInput :error-msg="errorMsg" @generate="generate" @clear="clearAll" />
        <InfoPanel :visible="!!activeTable" :table-name="info.tableName" :field-count="info.fieldCount" :fields="info.fields" />
      </div>
      <div class="card preview-card" :class="{ 'has-content': tables.length > 0 }">
        <div class="preview-header">
          <div class="card-title" style="margin-bottom:0">三线表预览</div>
        </div>
        <div class="tab-bar" :class="{ visible: tables.length > 1 }">
          <div v-for="(t, i) in tables" :key="i" :class="['tab-item', { active: i === activeIndex }]" @click="activeIndex = i">{{ t.tableDisplay }}</div>
        </div>
        <div class="preview-placeholder" v-if="tables.length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
          <p>在左侧输入 SQL 语句后点击生成</p>
        </div>
        <div class="table-container" v-show="tables.length > 0">
          <div class="table-caption">{{ activeTable?.tableDisplay }}</div>
          <table class="three-line-table">
            <thead>
              <tr>
                <th>字段名</th>
                <th>字段类型</th>
                <th>是否允许空</th>
                <th>默认值</th>
                <th>字段注释</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col in (activeTable?.columns || [])" :key="col.name">
                <td>{{ col.name }}</td>
                <td>{{ col.type }}</td>
                <td>{{ col.nullable }}</td>
                <td>{{ col.defaultVal }}</td>
                <td>{{ col.display }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="export-row" :class="{ visible: tables.length > 0 }">
          <button class="btn-export" @click="downloadPNG">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            下载 PNG
          </button>
          <button class="btn-export" @click="downloadWord">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            下载 Word
          </button>
          <button class="btn-export" @click="downloadExcel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            下载 Excel
          </button>
          <div class="batch-wrapper" :class="{ visible: tables.length > 1 }">
            <button class="btn-export-all" @click="showBatchMenu = !showBatchMenu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              批量下载全部
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-left:2px"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="batch-menu" :class="{ visible: showBatchMenu }">
              <div class="batch-menu-item" @click="batchDownload('png')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                全部下载 PNG
              </div>
              <div class="batch-menu-item" @click="batchDownload('word')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                全部下载 Word
              </div>
              <div class="batch-menu-item" @click="batchDownload('excel')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                全部下载 Excel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import SqlInput from '../components/SqlInput.vue'
import InfoPanel from '../components/InfoPanel.vue'
import Toast from '../components/Toast.vue'
import { splitCreateTables, parseCreateTable } from '../utils/sqlParser.js'
import JSZip from 'jszip'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, VerticalAlign, AlignmentType } from 'docx'
import * as XLSX from 'xlsx-js-style'

const tables = ref([])
const activeIndex = ref(0)
const errorMsg = ref('')
const info = ref({ tableName: '-', fieldCount: 0, fields: [] })
const toastRef = ref(null)
const showBatchMenu = ref(false)

const activeTable = computed(() => tables.value[activeIndex.value] || null)

function showToast(msg, type = 'success') {
  toastRef.value?.show(msg, type)
}

function generate(sql) {
  errorMsg.value = ''
  if (!sql.trim()) { errorMsg.value = '请输入 SQL 语句'; return }
  const statements = splitCreateTables(sql)
  if (statements.length === 0) { errorMsg.value = '未找到有效的 CREATE TABLE 语句'; return }
  const result = []
  for (const stmt of statements) {
    const parsed = parseCreateTable(stmt)
    if (parsed.columns.length > 0) result.push(parsed)
  }
  if (!result.length) { errorMsg.value = '解析失败，未获取到有效字段'; return }
  tables.value = result
  activeIndex.value = 0
  const first = result[0]
  info.value = { tableName: first.tableName, fieldCount: first.columns.length, fields: first.columns.map(c => c.display) }
  showToast('成功生成 ' + result.length + ' 张三线表', 'success')
}

function clearAll() {
  tables.value = []
  activeIndex.value = 0
  errorMsg.value = ''
  info.value = { tableName: '-', fieldCount: 0, fields: [] }
}

// Watch activeIndex to update info
import { watch } from 'vue'
watch(activeIndex, () => {
  const t = activeTable.value
  if (t) {
    info.value = { tableName: t.tableName, fieldCount: t.columns.length, fields: t.columns.map(c => c.display) }
  }
})

// --- PNG Export ---
async function downloadPNG() {
  const t = activeTable.value
  if (!t) return
  const container = document.querySelector('.table-container')
  if (!container) return

  // Build SVG from table data
  const headers = ['字段名', '字段类型', '是否允许空', '默认值', '字段注释']
  const rows = t.columns.map(c => [c.name, c.type, c.nullable, c.defaultVal, c.display])
  const colWidths = [160, 180, 100, 140, 220]
  const totalW = colWidths.reduce((a, b) => a + b, 0)
  const rowH = 36
  const headerH = 40
  const captionH = 40
  const padding = 20
  const totalH = captionH + headerH + rows.length * rowH + padding * 2

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`
  svg += `<rect width="${totalW}" height="${totalH}" fill="#ffffff"/>`

  // Caption
  svg += `<text x="${totalW / 2}" y="${padding + 24}" text-anchor="middle" font-family="SimSun, serif" font-size="16" font-weight="bold" fill="#000000">${escapeXml(t.tableDisplay)}</text>`

  const tableY = padding + captionH

  // Top line (thick)
  svg += `<line x1="0" y1="${tableY}" x2="${totalW}" y2="${tableY}" stroke="#000000" stroke-width="2"/>`

  // Header row
  let x = 0
  for (let i = 0; i < headers.length; i++) {
    svg += `<text x="${x + colWidths[i] / 2}" y="${tableY + headerH / 2 + 6}" text-anchor="middle" font-family="SimSun, serif" font-size="14" font-weight="bold" fill="#000000">${escapeXml(headers[i])}</text>`
    x += colWidths[i]
  }

  // Header bottom line (thin)
  svg += `<line x1="0" y1="${tableY + headerH}" x2="${totalW}" y2="${tableY + headerH}" stroke="#000000" stroke-width="1"/>`

  // Data rows
  for (let r = 0; r < rows.length; r++) {
    const y = tableY + headerH + r * rowH
    x = 0
    for (let c = 0; c < rows[r].length; c++) {
      svg += `<text x="${x + colWidths[c] / 2}" y="${y + rowH / 2 + 5}" text-anchor="middle" font-family="SimSun, serif" font-size="13" fill="#000000">${escapeXml(rows[r][c] || '-')}</text>`
      x += colWidths[c]
    }
  }

  // Bottom line (thick)
  const bottomY = tableY + headerH + rows.length * rowH
  svg += `<line x1="0" y1="${bottomY}" x2="${totalW}" y2="${bottomY}" stroke="#000000" stroke-width="2"/>`

  svg += `</svg>`

  // SVG → Canvas → PNG
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  img.onload = () => {
    const scale = 3
    const canvas = document.createElement('canvas')
    canvas.width = totalW * scale
    canvas.height = totalH * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, totalW, totalH)
    ctx.drawImage(img, 0, 0, totalW, totalH)
    canvas.toBlob(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = (t.tableDisplay || 'table') + '.png'
      a.click()
      URL.revokeObjectURL(a.href)
      URL.revokeObjectURL(url)
      showToast('已下载 PNG', 'success')
    }, 'image/png')
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    showToast('PNG 导出失败', 'error')
  }
  img.src = url
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// --- Word Export ---
async function downloadWord() {
  try {
  const t = activeTable.value
  if (!t) return
  const thick = { style: BorderStyle.SINGLE, size: 12, color: '000000' }
  const thin = { style: BorderStyle.SINGLE, size: 6, color: '000000' }
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const mkB = (t, b, l, r) => ({ top: t, bottom: b, left: l, right: r })
  const noBorder = mkB(none, none, none, none)
  const rowHeight = { value: 680, rule: 'atLeast' } // 1.2cm minimum
  const headers = ['字段名', '字段类型', '是否允许空', '默认值', '字段注释']
  const mkCell = (text, bold, borders) => new TableCell({
    borders,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240 }, children: [new TextRun({ text, bold: !!bold, size: 21, font: { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'SimSun' } })] })]
  })
  const hRow = new TableRow({
    tableHeader: true,
    height: rowHeight,
    children: headers.map((h) => mkCell(h, true, mkB(thick, thin, none, none)))
  })
  const bRows = t.columns.map((col, ci) => {
    const isLast = ci === t.columns.length - 1
    const b = mkB(none, isLast ? thick : none, none, none)
    return new TableRow({
      height: rowHeight,
      children: [col.name, col.type, col.nullable, col.defaultVal, col.display].map(v => mkCell(v || '-', false, b))
    })
  })
  const doc = new Document({
    styles: { default: { document: { run: { font: { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'SimSun' }, size: 21 } } } },
    sections: [{
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: t.tableDisplay, bold: true, size: 24, font: { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'SimSun' } })] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1800, 2200, 1400, 1800, 2800], rows: [hRow, ...bRows] })
      ]
    }]
  })
  const blob = await Packer.toBlob(doc)
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (t.tableDisplay || 'table') + '.docx'; a.click()
  URL.revokeObjectURL(a.href)
  showToast('已下载 Word', 'success')
  } catch (e) {
    console.error('Word export error:', e)
    showToast('Word 导出失败: ' + e.message, 'error')
  }
}

// --- Excel Export ---
function downloadExcel() {
  const t = activeTable.value
  if (!t) return
  const wb = XLSX.utils.book_new()

  const headers = ['字段名', '字段类型', '是否允许空', '默认值', '字段注释']
  const rows = t.columns.map(c => [c.name, c.type, c.nullable, c.defaultVal, c.display])

  // Build styled aoa
  const aoa = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Column widths
  ws['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 30 }]

  // Row heights
  ws['!rows'] = [{ hpt: 28 }, ...rows.map(() => ({ hpt: 24 }))]

  // Border styles
  const thinBottom = { bottom: { style: 'thin', color: { rgb: '000000' } } }
  const thickTop = { top: { style: 'medium', color: { rgb: '000000' } } }
  const thickBottom = { bottom: { style: 'medium', color: { rgb: '000000' } } }
  const noBorder = {}

  // Apply styles to each cell
  for (let R = 0; R < aoa.length; R++) {
    for (let C = 0; C < aoa[R].length; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[addr]) ws[addr] = { v: aoa[R][C], t: 's' }
      const isHeader = R === 0
      const isLastRow = R === aoa.length - 1
      let border = { ...noBorder }
      if (isHeader) {
        border = { ...thickTop, ...thinBottom }
      } else if (isLastRow) {
        border = { ...thickBottom }
      }
      ws[addr].s = {
        border,
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { name: '宋体', sz: 11, bold: isHeader },
        fill: { fgColor: { rgb: 'FFFFFF' } }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, t.tableName.substring(0, 31))
  XLSX.writeFile(wb, (t.tableDisplay || 'table') + '.xlsx')
  showToast('已下载 Excel', 'success')
}

// --- Batch Export ---
async function batchDownload(format) {
  showBatchMenu.value = false
  if (format === 'png') {
    // All PNG → ZIP
    const zip = new JSZip()
    const folder = zip.folder('tables')
    for (const t of tables.value) {
      const blob = await generatePNGBlob(t)
      folder.file((t.tableDisplay || 'table') + '.png', blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = 'tables.zip'
    a.click()
    URL.revokeObjectURL(a.href)
    showToast('已下载全部 PNG (ZIP)', 'success')
    return
  }

  if (format === 'word') {
    // All tables → one Word file
    const children = []
    const thick = { style: BorderStyle.SINGLE, size: 12, color: '000000' }
    const thin = { style: BorderStyle.SINGLE, size: 6, color: '000000' }
    const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    const mkB = (t, b, l, r) => ({ top: t, bottom: b, left: l, right: r })
    const rowHeight = { value: 680, rule: 'atLeast' }
    const headers = ['字段名', '字段类型', '是否允许空', '默认值', '字段注释']
    const mkCell = (text, bold, borders) => new TableCell({
      borders, verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240 }, children: [new TextRun({ text, bold: !!bold, size: 21, font: { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'SimSun' } })] })]
    })
    for (const t of tables.value) {
      children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: t.tableDisplay, bold: true, size: 24, font: { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'SimSun' } })] }))
      const hRow = new TableRow({ tableHeader: true, height: rowHeight, children: headers.map(h => mkCell(h, true, mkB(thick, thin, none, none))) })
      const bRows = t.columns.map((col, ci) => {
        const isLast = ci === t.columns.length - 1
        return new TableRow({ height: rowHeight, children: [col.name, col.type, col.nullable, col.defaultVal, col.display].map(v => mkCell(v || '-', false, mkB(none, isLast ? thick : none, none, none))) })
      })
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [1800, 2200, 1400, 1800, 2800], rows: [hRow, ...bRows] }))
      children.push(new Paragraph({ spacing: { after: 400 }, children: [] }))
    }
    const doc = new Document({
      styles: { default: { document: { run: { font: { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'SimSun' }, size: 21 } } } },
      sections: [{ children }]
    })
    const blob = await Packer.toBlob(doc)
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tables.docx'; a.click()
    URL.revokeObjectURL(a.href)
    showToast('已下载全部 Word', 'success')
    return
  }

  if (format === 'excel') {
    // All tables → one Excel file, each table in same sheet separated by blank row
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    const headers = ['字段名', '字段类型', '是否允许空', '默认值', '字段注释']
    const thinBottom = { bottom: { style: 'thin', color: { rgb: '000000' } } }
    const thickTop = { top: { style: 'medium', color: { rgb: '000000' } } }
    const thickBottom = { bottom: { style: 'medium', color: { rgb: '000000' } } }
    let startR = 0
    for (const t of tables.value) {
      // Add table caption
      const captionAddr = XLSX.utils.encode_cell({ r: startR, c: 0 })
      ws[captionAddr] = { v: t.tableDisplay, t: 's', s: { font: { name: '宋体', sz: 14, bold: true }, alignment: { horizontal: 'center' } } }
      ws[XLSX.utils.encode_range({ s: { r: startR, c: 0 }, e: { r: startR, c: 4 } })] = { s: { font: { name: '宋体', sz: 14, bold: true }, alignment: { horizontal: 'center' } } }
      startR++
      // Header row
      const headerR = startR
      for (let C = 0; C < headers.length; C++) {
        const addr = XLSX.utils.encode_cell({ r: headerR, c: C })
        ws[addr] = { v: headers[C], t: 's', s: { border: { ...thickTop, ...thinBottom }, alignment: { horizontal: 'center', vertical: 'center' }, font: { name: '宋体', sz: 11, bold: true } } }
      }
      startR++
      // Data rows
      const rows = t.columns.map(c => [c.name, c.type, c.nullable, c.defaultVal, c.display])
      for (let ri = 0; ri < rows.length; ri++) {
        const isLast = ri === rows.length - 1
        for (let C = 0; C < rows[ri].length; C++) {
          const addr = XLSX.utils.encode_cell({ r: startR, c: C })
          let border = {}
          if (isLast) border = { ...thickBottom }
          ws[addr] = { v: rows[ri][C], t: 's', s: { border, alignment: { horizontal: 'center', vertical: 'center' }, font: { name: '宋体', sz: 11 } } }
        }
        startR++
      }
      // Blank row separator
      startR++
    }
    ws['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 30 }]
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: startR - 1, c: 4 } })
    XLSX.utils.book_append_sheet(wb, ws, 'Tables')
    XLSX.writeFile(wb, 'tables.xlsx')
    showToast('已下载全部 Excel', 'success')
    return
  }
}

// Helper: generate PNG blob from table data
function generatePNGBlob(t) {
  return new Promise((resolve, reject) => {
    const headers = ['字段名', '字段类型', '是否允许空', '默认值', '字段注释']
    const rows = t.columns.map(c => [c.name, c.type, c.nullable, c.defaultVal, c.display])
    const colWidths = [160, 180, 100, 140, 220]
    const totalW = colWidths.reduce((a, b) => a + b, 0)
    const rowH = 36
    const headerH = 40
    const captionH = 40
    const padding = 20
    const totalH = captionH + headerH + rows.length * rowH + padding * 2
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`
    svg += `<rect width="${totalW}" height="${totalH}" fill="#ffffff"/>`
    svg += `<text x="${totalW / 2}" y="${padding + 24}" text-anchor="middle" font-family="SimSun, serif" font-size="16" font-weight="bold" fill="#000000">${escapeXml(t.tableDisplay)}</text>`
    const tableY = padding + captionH
    svg += `<line x1="0" y1="${tableY}" x2="${totalW}" y2="${tableY}" stroke="#000000" stroke-width="2"/>`
    let x = 0
    for (let i = 0; i < headers.length; i++) {
      svg += `<text x="${x + colWidths[i] / 2}" y="${tableY + headerH / 2 + 6}" text-anchor="middle" font-family="SimSun, serif" font-size="14" font-weight="bold" fill="#000000">${escapeXml(headers[i])}</text>`
      x += colWidths[i]
    }
    svg += `<line x1="0" y1="${tableY + headerH}" x2="${totalW}" y2="${tableY + headerH}" stroke="#000000" stroke-width="1"/>`
    for (let r = 0; r < rows.length; r++) {
      const y = tableY + headerH + r * rowH
      x = 0
      for (let c = 0; c < rows[r].length; c++) {
        svg += `<text x="${x + colWidths[c] / 2}" y="${y + rowH / 2 + 5}" text-anchor="middle" font-family="SimSun, serif" font-size="13" fill="#000000">${escapeXml(rows[r][c] || '-')}</text>`
        x += colWidths[c]
      }
    }
    const bottomY = tableY + headerH + rows.length * rowH
    svg += `<line x1="0" y1="${bottomY}" x2="${totalW}" y2="${bottomY}" stroke="#000000" stroke-width="2"/>`
    svg += `</svg>`
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      const scale = 3
      const canvas = document.createElement('canvas')
      canvas.width = totalW * scale; canvas.height = totalH * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, totalW, totalH)
      ctx.drawImage(img, 0, 0, totalW, totalH)
      canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob) }, 'image/png')
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG render failed')) }
    img.src = url
  })
}

function onDocumentClick(e) {
  if (showBatchMenu.value && !e.target.closest('.batch-menu') && !e.target.closest('.btn-export-all')) {
    showBatchMenu.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<style scoped>
.page { max-width: 100%; margin: 0 auto; padding: 32px 15%; }
.header { text-align: center; margin-bottom: 40px; }
.header h1 { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.5px; color: var(--text-primary); margin-bottom: 8px; }
.header h1 span { color: var(--accent); }
.header p { font-size: 0.95rem; color: var(--text-secondary); font-weight: 300; }
.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.main-grid.stretched { align-items: stretch; }
.left-panel { display: flex; flex-direction: column; gap: 20px; }

/* Card styles matching DiagramPreview */
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.preview-card { display: flex; flex-direction: column; min-height: 380px; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }

/* Tab bar */
.tab-bar { display: none; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
.tab-bar.visible { display: flex; }
.tab-item { padding: 7px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); background: var(--bg-input); border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.tab-item:hover { color: var(--text-primary); border-color: var(--text-muted); }
.tab-item.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

/* Placeholder */
.preview-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 16px; min-height: 200px; }
.preview-placeholder svg { opacity: 0.3; }
.preview-placeholder p { font-size: 0.9rem; }

/* Table container */
.table-container { flex: 1; overflow: auto; padding: 10px 0; }
.table-caption { text-align: center; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 10px; }

/* Three-line table */
.three-line-table { width: 100%; border-collapse: collapse; border-top: 2px solid var(--text-primary); }
.three-line-table thead tr { border-bottom: 1px solid var(--text-primary); }
.three-line-table th { padding: 10px 12px; text-align: center; font-weight: 700; font-size: 0.88rem; color: var(--text-primary); border: none; }
.three-line-table td { padding: 8px 12px; text-align: center; font-size: 0.85rem; color: var(--text-secondary); border: none; }
.three-line-table tbody tr:last-child td { border-bottom: 2px solid var(--text-primary); }

/* Export row */
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
@keyframes menuFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 960px) {
  .main-grid { grid-template-columns: 1fr; }
  .page { padding: 20px; }
}
</style>
