import React from 'react'
import type { Operation } from '../types'

interface EditPanelProps {
  edit: {
    op: Operation
    startLocal: string
    endLocal: string
  }
  setEdit: (edit: any) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export function EditPanel({ edit, setEdit, onSubmit, loading }: EditPanelProps) {
  return (
    <div className="edit-panel-overlay">
      <div className="edit-panel" onClick={e => e.stopPropagation()}>
        <div className="edit-panel-header">
          <h2 className="edit-panel-title">
            <span className="edit-icon">✏️</span>
            Edit Operation
          </h2>
          <button 
            className="edit-close-btn" 
            onClick={() => setEdit(null)}
            aria-label="Close edit panel"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="edit-form">
          <div className="edit-section">
            <h3 className="section-title">Operation Details</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Operation ID</label>
                <div className="form-value">{edit.op.id}</div>
              </div>
              <div className="form-field">
                <label className="form-label">Work Order</label>
                <div className="form-value">{edit.op.workOrderId}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Machine</label>
                <div className="form-value machine-badge">{edit.op.machineId}</div>
              </div>
              <div className="form-field">
                <label className="form-label">Operation Name</label>
                <div className="form-value">{edit.op.name}</div>
              </div>
            </div>
          </div>

          <div className="edit-section">
            <h3 className="section-title">Schedule</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="start-time">
                  Start Time
                </label>
                <input
                  id="start-time"
                  type="datetime-local"
                  value={edit.startLocal}
                  onChange={e => setEdit({ ...edit, startLocal: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="end-time">
                  End Time
                </label>
                <input
                  id="end-time"
                  type="datetime-local"
                  value={edit.endLocal}
                  onChange={e => setEdit({ ...edit, endLocal: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="duration-info">
              <span className="duration-label">Duration:</span>
              <span className="duration-value">
                {calculateDuration(edit.startLocal, edit.endLocal)}
              </span>
            </div>
          </div>

          <div className="edit-panel-footer">
            <div className="edit-note">
              <span className="note-icon">ℹ️</span>
              Times are in local timezone and will be saved as UTC
            </div>
            
            <div className="edit-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setEdit(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function calculateDuration(start: string, end: string): string {
  if (!start || !end) return 'Invalid'
  
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  
  if (diffMs < 0) return 'Invalid (end before start)'
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
