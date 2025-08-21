import type { Operation } from './types'

export const BAR_HEIGHT = 48
export const ROW_GAP = 8
export const TRACK_PAD_TOP = 10
export const TRACK_PAD_BOTTOM = 10

export type RowLayout = { rows: number; rowById: Map<string, number> }

export function layoutRows(operations: Operation[]): RowLayout {
	const ops = [...operations].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
	const rowEndMs: number[] = []
	const rowById = new Map<string, number>()
	for (const op of ops) {
		const s = new Date(op.start).getTime()
		const e = new Date(op.end).getTime()
		let placed = false
		for (let r = 0; r < rowEndMs.length; r++) {
			// Require a tiny gap to prevent visual overlap from rounding
			if (s >= rowEndMs[r] + 1000) {
				rowById.set(op.id, r)
				rowEndMs[r] = e
				placed = true
				break
			}
		}
		if (!placed) {
			rowById.set(op.id, rowEndMs.length)
			rowEndMs.push(e)
		}
	}
	return { rows: rowEndMs.length || 1, rowById }
} 