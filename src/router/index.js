import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Diagram Tools' }
  },
  {
    path: '/sql-to-er',
    name: 'SqlToEr',
    component: () => import('../views/SqlToEr.vue'),
    meta: { title: 'SQL to ER' }
  },
  {
    path: '/mermaid',
    name: 'Mermaid',
    component: () => import('../views/Mermaid.vue'),
    meta: { title: 'Mermaid' }
  },
  {
    path: '/use-case',
    name: 'UseCase',
    component: () => import('../views/UseCase.vue'),
    meta: { title: 'Use Case' }
  },
  {
    path: '/system-module',
    name: 'SystemModule',
    component: () => import('../views/SystemModule.vue'),
    meta: { title: 'System Module' }
  },
  {
    path: '/sql-to-table',
    name: 'SqlToTable',
    component: () => import('../views/SqlToTable.vue'),
    meta: { title: 'SQL to Table' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? to.meta.title + ' - Diagram Tools' : 'Diagram Tools'
  next()
})

export default router
