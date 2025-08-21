import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onEscape?: () => void
  onRefresh?: () => void
  onClear?: () => void
  onSave?: () => void
  onDelete?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      // Check for modifier keys
      const isCtrl = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey
      const isAlt = event.altKey

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          config.onEscape?.()
          break
          
        case 'r':
        case 'R':
          if (isCtrl) {
            event.preventDefault()
            config.onRefresh?.()
          }
          break
          
        case 'c':
        case 'C':
          if (isCtrl && isShift) {
            event.preventDefault()
            config.onClear?.()
          }
          break
          
        case 's':
        case 'S':
          if (isCtrl) {
            event.preventDefault()
            config.onSave?.()
          }
          break
          
        case 'Delete':
        case 'Backspace':
          if (isCtrl) {
            event.preventDefault()
            config.onDelete?.()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [config])
}
