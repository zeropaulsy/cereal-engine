// EntityManager Class : EntityManager(Maximum Entities)
class EntityManager {
	constructor(max) {
		let self = this;
		this.max = max;
		this.playerSpawned = false;
		this.entityTypes = ['tile', 'enemy', 'bullet', 'turret', 'powerup'];
		this.entities = [];
		this.tiles    = [];
		this.enemies  = [];
		this.powerups = [];
		this.turrets  = [];
		this.bullets  = [];
	}
	run() {
		// Loop through entites array
		for (let i = this.entities.length-1; i >= 0; i--) {
			let e = this.entities[i];

			if (!g_paused) e.update();
			e.display();
		}
		// Check for collisions between arrays
		arrayCollisionBetween1(this.enemies, this.tiles,   (a, b) => { });

		arrayCollisionBetween1(this.turrets, this.tiles,   (a, b) => { });

		arrayCollisionBetween1(this.bullets, this.tiles,   (a, b) => { a.destroy() });

		arrayCollisionBetween2(this.enemies, this.turrets, (a, b) => { b.health--; });

		arrayCollisionBetween2(this.bullets, this.enemies, (a, b) => { a.health -= 1; b.health -= a.damage; });

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
	spawnPlayer(id, spr, x, y, w, h, s, f, k) {
		// Create player and add to entities array
		if (!this.playerSpawned) {
			this.entities.push(new Player(id, spr, x, y, w, h, s, f, k));
			// Toggle boolean meaning only one player entity can be added to array
			this.playerSpawned = true;
		} else {
			// Log player already spawned if multiple attemps to spawn a player are made
			console.log('Player has already been spawned.');
		}
	}
	spawnEnemy(id, spr, t, x, y, w, h, hb, s, l, ds, sv) {
		if (this.entities.length < this.max) {
			// New bullet to entities array
			this.entities.push(new Enemy(id, spr, t, x, y, w, h, hb, s, l, ds, sv));
			// this.enemies.push(new Enemy(id, spr, t, x, y, w, h, hb, s, l, ds, sv));
			// Update array of bullets
			this.filterEntities('enemy');
			// this.entities.concat(this.enemies)
		} else {
			// Log warning if entity limit reached or exceeded
			console.warn('Could not spawn enemy. Maximum number of entities reached: ' + this.max);
		}
	}
	spawnPowerup(id, sprite, x, y, width, height, onCollision) {
		if (this.entities.length < this.max) {
			// New bullet to entities array
			this.entities.push(new Powerup(id, sprite, x, y, width, height, onCollision));
			// Update array of powerups
			this.filterEntities('powerup');
		} else {
			// Log warning if entity limit reached or exceeded
			console.warn('Could not spawn enemy. Maximum number of entities reached: ' + this.max);
		}
	}
	spawnTurret(id, sprite, target, x, y, width, height, health, ammo, rotationSpeed, stationary) {
		if (this.entities.length < this.max) {
			// New entities to entities array
			this.entities.push(new Turret(id, sprite, target, x, y, width, height, health, ammo, rotationSpeed, stationary));
			// Update array of turrets
			this.filterEntities('turret');
		} else {
			// Log warning if entity limit reached or exceeded
			console.warn('Could not spawn turret. Maximum number of entities reached: ' + this.max);
		}
	}
	spawnBullet(id, spr, p, w, h) {
		if (this.entities.length < this.max) {
			// New entities to entities array
			this.entities.push(new Bullet(id, spr, p, w, h));
			// Update array of bullets
			this.filterEntities('bullet');
		} else {
			// Log warning if entity limit reached or exceeded
			console.warn('Could not spawn bullet. Maximum number of entities reached: ' + this.max);
		}
	}
	spawnTile(id, tilesheet, sx, sy, sw, sh, x, y, width, height, collision, knockBack) {
		this.entities.push(new Tile(id, tilesheet, sx, sy, sw, sh, x, y, width, height, collision, knockBack));
		this.filterEntities('tile');
	}
	filterEntities(t) {
		// Find bullets within the main entity array and index them
		if ( t == 'bullet' ) this.bullets  = this.entities.filter( x => x.entityType == t );
		if ( t == 'enemy'  ) this.enemies  = this.entities.filter( x => x.entityType == t );
		if ( t == 'turret' ) this.turrets  = this.entities.filter( x => x.entityType == t );
		if ( t == 'tile'   ) this.tiles    = this.entities.filter( x => x.entityType == t );
		if ( t == 'powerup') this.powerups = this.entities.filter( x => x.entityType == t );
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
			// Update entity specific arrays on kill
			this.filterEntities(e.entityType);
		} else {
			console.log('out of scope');
		}
	}
}
