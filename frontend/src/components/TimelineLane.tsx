import React, { useMemo } from 'react'
import type { Operation } from '../types'
import { BAR_HEIGHT, ROW_GAP, TRACK_PAD_TOP, TRACK_PAD_BOTTOM, layoutRows } from '../layout'
import { TimelineBar } from './TimelineBar'

interface Props {
  machineId: string
  operations: Operation[]
  xPercent: (d: Date) => number
  highlightWoId: string | null
  onBarClick: (op: Operation) => void
  isDragging?: boolean
  dragData?: any
}

export function TimelineLane({ 
  machineId, 
  operations, 
  xPercent, 
  highlightWoId, 
  onBarClick,
  isDragging,
  dragData
}: Props) {
  console.log('TimelineLane render - machineId:', machineId, 'operations:', operations.length, 'highlightWoId:', highlightWoId)
  
  const sortedOps = useMemo(() => 
    [...operations].sort((a, b) => new Date(a.start).getTime() - new Date(a.start).getTime()), 
    [operations]
  )
  
  const { rows, rowById } = useMemo(() => layoutRows(sortedOps), [sortedOps])
  const trackHeight = TRACK_PAD_TOP + TRACK_PAD_BOTTOM + rows * BAR_HEIGHT + (rows - 1) * ROW_GAP

  // Enhanced conflict detection
  const conflicts = useMemo(() => {
    const conflicts: Array<{op1: Operation, op2: Operation}> = []
    for (let i = 0; i < sortedOps.length; i++) {
      for (let j = i + 1; j < sortedOps.length; j++) {
        const op1 = sortedOps[i]
        const op2 = sortedOps[j]
        const start1 = new Date(op1.start).getTime()
        const end1 = new Date(op1.end).getTime()
        const start2 = new Date(op2.start).getTime()
        const end2 = new Date(op2.end).getTime()
        
        if (start1 < end2 && start2 < end1) {
          conflicts.push({op1, op2})
        }
      }
    }
    return conflicts
  }, [sortedOps])

  // Get conflict IDs for highlighting
  const conflictIds = useMemo(() => {
    const ids = new Set<string>()
    conflicts.forEach(conflict => {
      ids.add(conflict.op1.id)
      ids.add(conflict.op2.id)
    })
    return ids
  }, [conflicts])

  return (
    <div className="timeline-lane">
      <div className="lane-header">
        <div className="lane-label">
          <span className="lane-icon">⚙️</span>
          <span className="lane-name">{machineId}</span>
          <span className="lane-count">({operations.length})</span>
        </div>
        {conflicts.length > 0 && (
          <div className="lane-warning" title={`${conflicts.length} conflicts detected`}>
            ⚠️ {conflicts.length} conflicts
          </div>
        )}
      </div>
      
      <div className="lane-track" style={{ height: `${trackHeight}px` }}>
        {sortedOps.map(op => {
          const left = xPercent(new Date(op.start))
          const right = xPercent(new Date(op.end))
          const width = Math.max(3, right - left)
          const highlighted = highlightWoId === op.workOrderId
          const row = rowById.get(op.id) ?? 0
          const top = TRACK_PAD_TOP + row * (BAR_HEIGHT + ROW_GAP)
          const hasConflict = conflictIds.has(op.id)
          const isBeingDragged = isDragging && dragData?.operation.id === op.id
          
          return (
            <TimelineBar
              key={op.id}
              op={op}
              leftPercent={left}
              widthPercent={width}
              topPx={top}
              heightPx={BAR_HEIGHT}
              highlighted={highlighted}
              hasConflict={hasConflict}
              isBeingDragged={isBeingDragged}
              onClick={onBarClick}
            />
          )
        })}
      </div>
    </div>
  )
} 