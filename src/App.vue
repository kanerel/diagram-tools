<template>
  <NavBar />
  <router-view />
</template>
<script setup>
import NavBar from './components/NavBar.vue'
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');
:root {
    --bg-primary: #0f1117; --bg-secondary: #1a1d27; --bg-card: #21242f;
    --bg-input: #282b38; --border: #2e3244; --border-focus: #e8a849;
    --text-primary: #e8eaf0; --text-secondary: #8b8fa3; --text-muted: #5c6078;
    --accent: #e8a849; --accent-hover: #f0b85a; --accent-dim: rgba(232,168,73,0.12);
    --success: #4ade80; --error: #f87171;
    --radius: 10px; --radius-lg: 16px;
    --shadow: 0 4px 24px rgba(0,0,0,0.3); --shadow-lg: 0 8px 40px rgba(0,0,0,0.4);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Noto Sans SC', sans-serif; background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; }
body::before { content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse 80% 50% at 20% 0%, rgba(232,168,73,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.04) 0%, transparent 60%); pointer-events: none; z-index: 0; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
