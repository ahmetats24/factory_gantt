import React, { useMemo, useState } from 'react'
import { useAppContext } from '../App'

export function FilterPanel() {
  const { workOrders, filters, setFilters } = useAppContext()
  const [isExpanded, setIsExpanded] = useState(false)

  // Get unique machines and work orders for filters
  const { machines, workOrderIds } = useMemo(() => {
    const machineSet = new Set<string>()
    const woSet = new Set<string>()
    
    workOrders.forEach(wo => {
      woSet.add(wo.id)
      wo.operations.forEach(op => machineSet.add(op.machineId))
    })
    
    return {
      machines: Array.from(machineSet).sort(),
      workOrderIds: Array.from(woSet).sort()
    }
  }, [workOrders])

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchTerm: value })
  }

  const handleMachineToggle = (machineId: string) => {
    const newMachines = filters.selectedMachines.includes(machineId)
      ? filters.selectedMachines.filter(id => id !== machineId)
      : [...filters.selectedMachines, machineId]
    setFilters({ ...filters, selectedMachines: newMachines })
  }

  const handleWorkOrderToggle = (woId: string) => {
    const newWorkOrders = filters.selectedWorkOrders.includes(woId)
      ? filters.selectedWorkOrders.filter(id => id !== woId)
      : [...filters.selectedWorkOrders, woId]
    setFilters({ ...filters, selectedWorkOrders: newWorkOrders })
  }

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      selectedMachines: [],
      selectedWorkOrders: []
    })
  }

  const hasActiveFilters = filters.searchTerm || 
    filters.selectedMachines.length > 0 || 
    filters.selectedWorkOrders.length > 0

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <span className="filter-icon">🔍</span>
          Filters
          {hasActiveFilters && (
            <span className="filter-badge">{getActiveFilterCount()}</span>
          )}
        </div>
        <div className="filter-controls">
          {hasActiveFilters && (
            <button 
              className="btn btn-sm btn-outline" 
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          )}
          <button 
            className="btn btn-sm btn-outline" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      <div className={`filter-content ${isExpanded ? 'filter-expanded' : ''}`}>
        {/* Search Filter */}
        <div className="filter-section">
          <label className="filter-label">Search</label>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search work orders or products..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
            {filters.searchTerm && (
              <button 
                className="search-clear"
                onClick={() => handleSearchChange('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Machine Filter */}
        <div className="filter-section">
          <label className="filter-label">Machines</label>
          <div className="filter-chips">
            {machines.map(machineId => (
              <button
                key={machineId}
                className={`filter-chip ${filters.selectedMachines.includes(machineId) ? 'filter-chip-active' : ''}`}
                onClick={() => handleMachineToggle(machineId)}
              >
                {machineId}
              </button>
            ))}
          </div>
        </div>

        {/* Work Order Filter */}
        <div className="filter-section">
          <label className="filter-label">Work Orders</label>
          <div className="filter-chips">
            {workOrderIds.map(woId => (
              <button
                key={woId}
                className={`filter-chip ${filters.selectedWorkOrders.includes(woId) ? 'filter-chip-active' : ''}`}
                onClick={() => handleWorkOrderToggle(woId)}
              >
                {woId}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="filter-stats">
          <div className="stat-item">
            <span className="stat-label">Total Work Orders:</span>
            <span className="stat-value">{workOrders.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Operations:</span>
            <span className="stat-value">
              {workOrders.reduce((sum, wo) => sum + wo.operations.length, 0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Machines:</span>
            <span className="stat-value">{machines.length}</span>
          </div>
        </div>
      </div>
    </div>
  )

  function getActiveFilterCount(): number {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.selectedMachines.length > 0) count++
    if (filters.selectedWorkOrders.length > 0) count++
    return count
  }
}
