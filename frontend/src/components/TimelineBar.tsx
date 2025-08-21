import React, { useState } from 'react'
import type { Operation } from '../types'

interface Props {
  op: Operation
  leftPercent: number
  widthPercent: number
  topPx: number
  heightPx: number
  highlighted: boolean
  hasConflict?: boolean
  isBeingDragged?: boolean
  onClick: (op: Operation) => void
}

export function TimelineBar({ 
  op, 
  leftPercent, 
  widthPercent, 
  topPx, 
  heightPx, 
  highlighted, 
  hasConflict,
  isBeingDragged,
  onClick 
}: Props) {
  const [isHovered, setIsHovered] = useState(false)

  const getBarClasses = () => {
    const classes = ['timeline-bar']
    if (highlighted) classes.push('bar-highlighted')
    if (hasConflict) classes.push('bar-conflict')
    if (isBeingDragged) classes.push('bar-dragging')
    if (isHovered) classes.push('bar-hovered')
    return classes.join(' ')
  }

  const getDuration = () => {
    const start = new Date(op.start)
    const end = new Date(op.end)
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getStartTime = () => {
    return new Date(op.start).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getEndTime = () => {
    return new Date(op.end).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div
      className={getBarClasses()}
      style={{ 
        left: `${leftPercent}%`, 
        width: `${widthPercent}%`, 
        top: `${topPx}px`, 
        height: `${heightPx}px` 
      }}
      onClick={(e) => { 
        e.stopPropagation()
        onClick(op) 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${op.workOrderId} · ${op.name}\n${getStartTime()} - ${getEndTime()} (${getDuration()})`}
    >
      <div className="bar-content">
        <div className="bar-header">
          <span className="bar-id">{op.workOrderId}</span>
          {hasConflict && <span className="bar-conflict-icon">⚠️</span>}
        </div>
        
        <div className="bar-body">
          <span className="bar-name">{op.name}</span>
          <span className="bar-duration">{getDuration()}</span>
        </div>
        
        <div className="bar-footer">
          <span className="bar-time">{getStartTime()}</span>
          <span className="bar-time">{getEndTime()}</span>
        </div>
      </div>

      {/* Tooltip for more details */}
      {isHovered && (
        <div className="bar-tooltip">
          <div className="tooltip-header">
            <strong>{op.workOrderId}</strong>
            <span className="tooltip-operation">{op.name}</span>
          </div>
          <div className="tooltip-details">
            <div className="tooltip-row">
              <span>Machine:</span>
              <span>{op.machineId}</span>
            </div>
            <div className="tooltip-row">
              <span>Start:</span>
              <span>{getStartTime()}</span>
            </div>
            <div className="tooltip-row">
              <span>End:</span>
              <span>{getEndTime()}</span>
            </div>
            <div className="tooltip-row">
              <span>Duration:</span>
              <span>{getDuration()}</span>
            </div>
            {hasConflict && (
              <div className="tooltip-warning">
                ⚠️ This operation has scheduling conflicts
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 