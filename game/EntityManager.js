// EntityManager Class : EntityManager(Maximum Entities)
class EntityManager {
	constructor(max) {
		let self = this;
		this.max = max;
		this.playerSpawned = false;
		this.entities = [];
		// One spatial grid per entity type, rebuilt every frame, so collision checks
		// can skip whole types (e.g. enemies never search through other enemies)
		this.cellSize  = 64;
		this.gridTypes = [];
		this.grids     = [];
		this.nearby    = [];
	}
	getGrid(type) {
		let i = this.gridTypes.indexOf(type);
		if (i !== -1) return this.grids[i];
		let grid = new SpatialGrid(this.cellSize);
		this.gridTypes.push(type);
		this.grids.push(grid);
		return grid;
	}
	rebuildGrids() {
		for (let i = 0; i < this.grids.length; i++) this.grids[i].clear();
		for (let i = 0; i < this.entities.length; i++) {
			let e = this.entities[i];
			this.getGrid(e.entityType).insert(e);
		}
	}
	queryNearby(e, exclude, padding) {
		// Entities near e, skipping e's own type and the excluded type.
		// The returned array is reused by the next query, so don't hold onto it.
		let nearby = this.nearby;
		nearby.length = 0;
		for (let i = 0; i < this.grids.length; i++) {
			let type = this.gridTypes[i];
			if (type === e.entityType || type === exclude) continue;
			let found = this.grids[i].query(e, padding);
			for (let j = 0; j < found.length; j++) nearby.push(found[j]);
		}
		return nearby;
	}
	run() {
		// Rebuild collision grids from this frame's positions
		this.rebuildGrids();
		// Loop through entites array
		for (let i = this.entities.length-1; i >= 0; i--) {
			let e = this.entities[i];

			if (!settings.paused) e.update();
			e.display();
		}
		// Sort zIndex based on Y position (in place, no per-frame allocations)
		this.entities.sort(function (a, b) {
			return (b.pos.y + b.height / 2) - (a.pos.y + a.height / 2);
		});
	}
	spawnEntity(e) {
		this.entities.push(e);
	}
	getEntityById(id) {
		// Return entity with specified id
		return this.entities.find(x => x.id === id);
	}
	removeEntity(e) {
		// Remove entity from array when killed
		let i = this.entities.indexOf(e);
		// Flag as removed, the collision grid still holds it until next frame
		e.removed = true;
		if (i !== -1) {
			this.entities.splice(i, 1);
		} else {
			console.log('Entity could not be found.');
		}
	}
}
