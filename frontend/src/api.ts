import type { WorkOrder } from './types'

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
	const res = await fetch('/api/work_orders')
	if (!res.ok) {
		throw new Error(`Failed to fetch work orders (${res.status})`)
	}
	return res.json()
}

export async function updateOperation(opId: string, startIsoUtc: string, endIsoUtc: string): Promise<void> {
	const res = await fetch(`/api/operations/${encodeURIComponent(opId)}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ start: startIsoUtc, end: endIsoUtc })
	})
	if (!res.ok) {
		let msg = `Update failed (${res.status})`
		try {
			const data = await res.json()
			if (data && data.error) msg = data.error
		} catch {}
		throw new Error(msg)
	}
} 