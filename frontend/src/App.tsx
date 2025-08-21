import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react'
import { fetchWorkOrders, updateOperation } from './api'
import type { Operation, WorkOrder } from './types'
import { TimelineLane } from './components/TimelineLane'
import { Header } from './components/Header'
import { EditPanel } from './components/EditPanel'
import { ToastContainer, Toast } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { FilterPanel } from './components/FilterPanel'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDragAndDrop } from './hooks/useDragAndDrop'
import './styles.css'

// Context for global state
interface AppContextType {
  workOrders: WorkOrder[]
  loading: boolean
  error: string | null
  highlightWoId: string | null
  setHighlightWoId: (id: string | null) => void
  refresh: () => Promise<void>
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  filters: {
    searchTerm: string
    selectedMachines: string[]
    selectedWorkOrders: string[]
  }
  setFilters: (filters: any) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

function parseIso(iso: string): Date {
  return new Date(iso)
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

type MachineLane = { machineId: string; operations: Operation[] }

export default function App() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightWoId, setHighlightWoId] = useState<string | null>(null)
  const [edit, setEdit] = useState<{ op: Operation; startLocal: string; endLocal: string } | null>(null)
  const [now, setNow] = useState<Date>(new Date())
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([])
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedMachines: [] as string[],
    selectedWorkOrders: [] as string[]
  })
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEscape: () => {
      setHighlightWoId(null)
      setEdit(null)
    },
    onRefresh: () => refresh(),
    onClear: () => setHighlightWoId(null)
  })

  // Drag and drop functionality
  const { isDragging, dragData } = useDragAndDrop()

  useEffect(() => {
    void refresh()
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchWorkOrders()
      setWorkOrders(data)
      showToast('Data refreshed successfully', 'success')
    } catch (e: any) {
      const errorMsg = e.message || 'Unknown error'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(message: string, type: 'success' | 'error' | 'info') {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  // Filter work orders based on search and filters
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Search term filter
      if (filters.searchTerm && !wo.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
          !wo.product.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false
      }
      
      // Work order filter
      if (filters.selectedWorkOrders.length > 0 && !filters.selectedWorkOrders.includes(wo.id)) {
        return false
      }
      
      // Machine filter
      if (filters.selectedMachines.length > 0) {
        const woMachines = wo.operations.map(op => op.machineId)
        if (!filters.selectedMachines.some(machine => woMachines.includes(machine))) {
          return false
        }
      }
      
      return true
    })
  }, [workOrders, filters])

  const allOps: Operation[] = useMemo(
    () => filteredWorkOrders.flatMap(w => w.operations),
    [filteredWorkOrders]
  )

  const lanes: MachineLane[] = useMemo(() => {
    const byMachine = new Map<string, Operation[]>()
    for (const op of allOps) {
      if (!byMachine.has(op.machineId)) byMachine.set(op.machineId, [])
      byMachine.get(op.machineId)!.push(op)
    }
    return Array.from(byMachine.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([machineId, ops]) => ({ machineId, operations: ops }))
  }, [allOps])

  const [minTime, maxTime] = useMemo((): [Date, Date] => {
    if (allOps.length === 0) {
      const now = new Date()
      const later = new Date(now.getTime() + 60 * 60 * 1000)
      return [now, later]
    }
    let min = new Date(Math.min(...allOps.map(o => parseIso(o.start).getTime())))
    let max = new Date(Math.max(...allOps.map(o => parseIso(o.end).getTime())))
    // padding 10 minutes each side
    min = new Date(min.getTime() - 10 * 60 * 1000)
    max = new Date(max.getTime() + 10 * 60 * 1000)
    return [min, max]
  }, [allOps])

  const totalMs = maxTime.getTime() - minTime.getTime()

  function xPercent(d: Date): number {
    if (totalMs <= 0) return 0
    const p = ((d.getTime() - minTime.getTime()) / totalMs) * 100
    return clamp(p, 0, 100)
  }

  function openEdit(op: Operation) {
    setHighlightWoId(op.workOrderId)
    setEdit({ 
      op, 
      startLocal: toLocalInputValue(op.start), 
      endLocal: toLocalInputValue(op.end) 
    })
  }

  function clearHighlightAndEdit() {
    setHighlightWoId(null)
    setEdit(null)
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!edit) return
    try {
      setLoading(true)
      setError(null)
      await updateOperation(
        edit.op.id, 
        localInputValueToIsoUtc(edit.startLocal), 
        localInputValueToIsoUtc(edit.endLocal)
      )
      await refresh()
      setHighlightWoId(edit.op.workOrderId)
      setEdit(null)
      showToast('Operation updated successfully', 'success')
    } catch (err: any) {
      const errorMsg = err.message || 'Update failed'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  function onBackgroundClick(ev: React.MouseEvent) {
    if (ev.target === containerRef.current) {
      clearHighlightAndEdit()
    }
  }

  const contextValue: AppContextType = {
    workOrders: filteredWorkOrders,
    loading,
    error,
    highlightWoId,
    setHighlightWoId,
    refresh,
    showToast,
    filters,
    setFilters
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        <Header />
        
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        <main className="main-content">
          <FilterPanel />
          
          <section className="timeline-section">
            <div className="timeline-container" ref={containerRef} onClick={onBackgroundClick}>
              {loading && <LoadingSpinner />}
              
              <div className="timeline-header">
                <div className="time-axis">
                  <span className="time-label">{minTime.toLocaleTimeString()}</span>
                  <span className="time-label">{maxTime.toLocaleTimeString()}</span>
                </div>
                <div className="timeline-controls">
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={() => setNow(new Date())}
                  >
                    Go to Now
                  </button>
                </div>
              </div>

              <div className="timeline-lanes">
                {lanes.map(lane => (
                  <TimelineLane
                    key={lane.machineId}
                    machineId={lane.machineId}
                    operations={lane.operations}
                    xPercent={xPercent}
                    highlightWoId={highlightWoId}
                    onBarClick={openEdit}
                    isDragging={isDragging}
                    dragData={dragData}
                  />
                ))}
              </div>

              <div 
                className="now-line" 
                style={{ left: `${xPercent(now)}%` }}
                title={`Current time: ${now.toLocaleTimeString()}`}
              />
            </div>

            <div className="timeline-legend">
              <div className="legend-item">
                <div className="legend-color now-color"></div>
                <span>Current Time</span>
              </div>
              <div className="legend-item">
                <div className="legend-color operation-color"></div>
                <span>Operation</span>
              </div>
              <div className="legend-item">
                <div className="legend-color selected-color"></div>
                <span>Selected Work Order</span>
              </div>
              {isDragging && (
                <div className="legend-item">
                  <div className="legend-color dragging-color"></div>
                  <span>Dragging</span>
                </div>
              )}
            </div>
          </section>
        </main>

        {edit && (
          <EditPanel
            edit={edit}
            setEdit={setEdit}
            onSubmit={submitEdit}
            loading={loading}
          />
        )}

        <ToastContainer>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            />
          ))}
        </ToastContainer>
      </div>
    </AppContext.Provider>
  )
}

// Utility functions
function toLocalInputValue(isoUtc: string): string {
  const d = new Date(isoUtc)
  const pad = (x: number) => x.toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function localInputValueToIsoUtc(local: string): string {
  const d = new Date(local)
  return d.toISOString()
} 