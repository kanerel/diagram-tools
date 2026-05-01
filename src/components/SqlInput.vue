<template>
  <div class="card">
    <div class="card-title">SQL 输入</div>
    <textarea class="sql-input" v-model="sql" placeholder="CREATE TABLE `users` (&#10;  `id` INT PRIMARY KEY,&#10;  `name` VARCHAR(255),&#10;  `email` VARCHAR(255)&#10;);&#10;&#10;CREATE TABLE `orders` (&#10;  `id` INT PRIMARY KEY,&#10;  `user_id` INT,&#10;  `amount` DECIMAL(10,2)&#10;);"></textarea>
    <div class="btn-row">
      <button class="btn btn-primary" @click="$emit('generate', sql)">
        {{ buttonText }}
      </button>
      <button class="btn btn-secondary" @click="sql = ''; $emit('clear')">清空</button>
    </div>
    <div class="error-msg" :class="{ visible: errorMsg }">{{ errorMsg }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const sql = ref('')
defineProps({ errorMsg: { type: String, default: '' }, buttonText: { type: String, default: '生成 ER 图' } })
defineEmits(['generate', 'clear'])
</script>
<style scoped>
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow); }
.card-title { font-size: 0.82rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
.card-title::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }
.sql-input { width: 100%; min-height: 380px; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 18px; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; line-height: 1.7; resize: vertical; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.sql-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-dim); }
.sql-input::placeholder { color: var(--text-muted); }
.btn-row { display: flex; gap: 10px; margin-top: 16px; }
.btn { flex: 1; padding: 12px 20px; border: none; border-radius: var(--radius); font-family: 'Noto Sans SC', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-primary { background: var(--accent); color: #0f1117; }
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,168,73,0.3); }
.btn-primary:active { transform: translateY(0); }
.btn-secondary { background: var(--bg-input); color: var(--text-secondary); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--border); color: var(--text-primary); }
.error-msg { margin-top: 14px; padding: 12px 16px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); border-radius: var(--radius); color: var(--error); font-size: 0.85rem; display: none; }
.error-msg.visible { display: block; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
