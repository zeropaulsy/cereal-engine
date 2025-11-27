// SpatialGrid Class : SpatialGrid(cell size in pixels)
// Buckets entities into grid cells so collision checks only look at nearby entities
class SpatialGrid {
	constructor(cellSize) {
		this.cellSize = cellSize;
		this.cells = new Map();   // cell key -> array of entities
		this.queryId = 0;         // stamped on entities to skip duplicates in query()
		this.results = [];        // reused every query to avoid allocations
	}
	key(cx, cy) {
		// Pack cell coords into one number (offset handles negative off-screen spawns)
		return (cx + 1000) * 4000 + (cy + 1000);
	}
	halfExtent(e) {
		// Circle collision mixes hitbox width and height, so use the larger for both axes
		return Math.max(e.hitbox.w, e.hitbox.h) / 2;
	}
	clear() {
		// Empty cells but keep the arrays, so nothing is reallocated each frame
		for (let cell of this.cells.values()) cell.length = 0;
	}
	insert(e) {
		// Add entity to every cell its bounding box overlaps
		let cs = this.cellSize;
		let r  = this.halfExtent(e);
		let x0 = Math.floor((e.pos.x - r) / cs);
		let x1 = Math.floor((e.pos.x + r) / cs);
		let y0 = Math.floor((e.pos.y - r) / cs);
		let y1 = Math.floor((e.pos.y + r) / cs);
		for (let cx = x0; cx <= x1; cx++) {
			for (let cy = y0; cy <= y1; cy++) {
				let k = this.key(cx, cy);
				let cell = this.cells.get(k);
				if (!cell) this.cells.set(k, cell = []);
				cell.push(e);
			}
		}
	}
	query(e, padding) {
		// Return every entity sharing a cell with e, each one only once.
		// The returned array is reused by the next query, so don't hold onto it.
		let cs = this.cellSize;
		let r  = this.halfExtent(e) + (padding || 0);
		let x0 = Math.floor((e.pos.x - r) / cs);
		let x1 = Math.floor((e.pos.x + r) / cs);
		let y0 = Math.floor((e.pos.y - r) / cs);
		let y1 = Math.floor((e.pos.y + r) / cs);
		let id = ++this.queryId;
		let results = this.results;
		results.length = 0;
		for (let cx = x0; cx <= x1; cx++) {
			for (let cy = y0; cy <= y1; cy++) {
				let cell = this.cells.get(this.key(cx, cy));
				if (!cell) continue;
				for (let i = 0; i < cell.length; i++) {
					let o = cell[i];
					// Entities spanning several cells would otherwise appear more than once
					if (o._gridQuery === id) continue;
					o._gridQuery = id;
					results.push(o);
				}
			}
		}
		return results;
	}
}
