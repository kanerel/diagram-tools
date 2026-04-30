<template>
  <div :class="['toast', visible ? 'show' : '', type]">{{ message }}</div>
</template>
<script setup>
import { ref } from 'vue'
const message = ref('')
const visible = ref(false)
const type = ref('success')
let timer = null
function show(msg, t = 'success') {
  message.value = msg
  type.value = t
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, 2500)
}
defineExpose({ show })
</script>
<style scoped>
.toast {
  position: fixed; bottom: 32px; left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--bg-card); border: 1px solid var(--border);
  color: var(--text-primary); padding: 12px 24px;
  border-radius: var(--radius); font-size: 0.88rem;
  box-shadow: var(--shadow-lg); z-index: 1000;
  opacity: 0; transition: all 0.3s ease; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.error { border-color: rgba(248,113,113,0.4); color: var(--error); }
.toast.success { border-color: rgba(74,222,128,0.4); color: var(--success); }
</style>
