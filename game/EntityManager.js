// EntityManager Class : EntityManager(Maximum Entities)
class EntityManager {
	constructor(max) {
		let self = this;
		this.max = max;
		this.playerSpawned = false;
		this.entities = [];
	}
	run() {
		// Loop through entites array
		for (let i = this.entities.length-1; i >= 0; i--) {
			let e = this.entities[i];

			if (!g_paused) e.update();
			e.display();
		}
		// Sort zIndex based on Y position
		this.map = this.entities.map(function(el, index) {
			return { index : index, value : el.pos.y + (el.height/2) };
		})

		this.map.sort(function (a, b) {
		  return b.value - a.value;
		});

		this.entities = this.map.map(function (el) {
		  return entityManager.entities[el.index];
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
		if (i !== -1) {
			this.entities.splice(i, 1);
		} else {
			console.log('Entity could not be found.');
		}
	}
}
