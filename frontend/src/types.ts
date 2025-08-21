export interface Operation {
	id: string
	workOrderId: string
	index: number
	machineId: string
	name: string
	start: string // ISO-8601 UTC
	end: string   // ISO-8601 UTC
}

export interface WorkOrder {
	id: string
	product: string
	qty: number
	operations: Operation[]
} 