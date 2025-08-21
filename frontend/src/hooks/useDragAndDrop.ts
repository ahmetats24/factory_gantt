import { useState, useCallback } from 'react'
import type { Operation } from '../types'

interface DragData {
  operation: Operation
  originalStart: string
  originalEnd: string
}

export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false)
  const [dragData, setDragData] = useState<DragData | null>(null)

  const startDrag = useCallback((operation: Operation) => {
    setIsDragging(true)
    setDragData({
      operation,
      originalStart: operation.start,
      originalEnd: operation.end
    })
  }, [])

  const endDrag = useCallback(() => {
    setIsDragging(false)
    setDragData(null)
  }, [])

  const updateDragPosition = useCallback((newStart: string, newEnd: string) => {
    if (dragData) {
      setDragData({
        ...dragData,
        operation: {
          ...dragData.operation,
          start: newStart,
          end: newEnd
        }
      })
    }
  }, [dragData])

  return {
    isDragging,
    dragData,
    startDrag,
    endDrag,
    updateDragPosition
  }
}
