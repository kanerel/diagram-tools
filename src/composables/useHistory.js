/**
 * useHistory.js - 通用撤销/重做 composable
 *
 * 使用方式：
 *   const { undo, redo, canUndo, canRedo, pushHistory } = useHistory(snapshotFn, onRestore)
 *
 *   snapshotFn: () => any  返回当前状态的快照（深拷贝）
 *   onRestore: (snapshot) => void  恢复快照时的回调
 *
 * 重要：pushHistory() 必须在状态修改之后调用！
 *   例如：
 *     function addItem() {
 *       items.value.push(newItem)   // 1. 先修改状态
 *       pushHistory()               // 2. 再保存快照
 *     }
 *
 *   这样 undo 时会恢复到修改前的状态。
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useHistory(snapshotFn, onRestore) {
  const history = ref([])
  const historyIndex = ref(-1)
  const canUndo = ref(false)
  const canRedo = ref(false)

  function _updateFlags() {
    canUndo.value = historyIndex.value > 0
    canRedo.value = historyIndex.value < history.value.length - 1
  }

  /**
   * 在修改状态之后调用，保存当前快照
   */
  function pushHistory() {
    const snapshot = snapshotFn()
    // 如果当前不在历史末尾，丢弃后面的记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(snapshot)
    // 限制历史记录最大数量
    if (history.value.length > 100) {
      history.value.shift()
    }
    historyIndex.value = history.value.length - 1
    _updateFlags()
  }

  /**
   * 撤销：恢复到上一个快照
   */
  function undo() {
    if (!canUndo.value) return null
    historyIndex.value--
    const snapshot = history.value[historyIndex.value]
    if (onRestore) onRestore(snapshot)
    _updateFlags()
    return snapshot
  }

  /**
   * 重做：恢复到下一个快照
   */
  function redo() {
    if (!canRedo.value) return null
    historyIndex.value++
    const snapshot = history.value[historyIndex.value]
    if (onRestore) onRestore(snapshot)
    _updateFlags()
    return snapshot
  }

  /**
   * 清空历史记录
   */
  function clearHistory() {
    history.value = []
    historyIndex.value = -1
    _updateFlags()
  }

  // 键盘快捷键
  function onKeyDown(e) {
    // 不在输入框中时才响应
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      redo()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault()
      redo()
    }
  }

  onMounted(() => document.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown))

  return { undo, redo, canUndo, canRedo, pushHistory, clearHistory }
}
