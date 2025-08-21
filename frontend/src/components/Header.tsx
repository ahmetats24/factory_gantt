import React from 'react'
import { useAppContext } from '../App'

export function Header() {
  const { loading, refresh, highlightWoId, setHighlightWoId } = useAppContext()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <span className="title-icon">⚙️</span>
            Factory Gantt
          </h1>
          <div className="header-subtitle">Production Schedule Management</div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => refresh()} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Refreshing...
              </>
            ) : (
              <>
                <span className="btn-icon">🔄</span>
                Refresh
              </>
            )}
          </button>
          
          {highlightWoId && (
            <button 
              className="btn btn-outline" 
              onClick={() => setHighlightWoId(null)}
            >
              <span className="btn-icon">✕</span>
              Clear Selection
            </button>
          )}
          
          <div className="header-info">
            <span className="info-item">
              <span className="info-icon">🕒</span>
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
