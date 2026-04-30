<template>
  <div class="card info-panel" :class="{ visible: visible }">
    <div class="card-title">解析结果</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">表名</div>
        <div class="info-value accent">{{ tableName }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">字段数量</div>
        <div class="info-value">{{ fieldCount }}</div>
      </div>
      <div class="info-item full">
        <div class="info-label">字段列表</div>
        <div class="field-tags">
          <span class="field-tag" v-for="f in fields" :key="f">{{ f }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({ visible: Boolean, tableName: { type: String, default: '-' }, fieldCount: { type: Number, default: 0 }, fields: { type: Array, default: () => [] } })
</script>
<style scoped>
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }
.info-panel { margin-top: 20px; display: none; }
.info-panel.visible { display: block; animation: slideIn 0.3s ease; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-item { background: var(--bg-input); border-radius: var(--radius); padding: 14px 16px; }
.info-item.full { grid-column: 1 / -1; }
.info-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
.info-value { font-size: 1rem; font-weight: 500; color: var(--text-primary); }
.info-value.accent { color: var(--accent); }
.field-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.field-tag { background: var(--accent-dim); color: var(--accent); padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-family: 'JetBrains Mono', monospace; font-weight: 500; }
@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
