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
			if (e.kill) {
				// Increase score if enemy killed by the player with its score value
				if (e.lastCollision.entityType == 'bullet') Game.getCurrentState().score += e.scoreValue;
				// Remove entity from array when killed
				this.entities.splice(i, 1);
				// Update entity specific arrays on kill
				for (let j = 0; j < this.entityTypes.length; j++) {
					let ent = this.entityTypes[j];
					if ( e.entityType == ent ) this.filterEntities( ent )
				}
			}
			// Calculate path to player
			if (e.entityType == 'enemy') {
				if (e.tile.x/g_tileSize < Game.getCurrentState().map.cols && e.tile.y/g_tileSize < Game.getCurrentState().map.rows && e.tile.x/g_tileSize > 0 && e.tile.y/g_tileSize > 0) {
					if (!g_paused) this.findEntityPath(e);
				}
			}

			e.display();
			if (!g_paused) e.update();
		}
		// Check for collisions between arrays
		arrayCollisionBetween1(this.enemies, this.tiles,   (a, b) => { });

		arrayCollisionBetween1(this.turrets, this.tiles,   (a, b) => { });

		arrayCollisionBetween1(this.bullets, this.tiles,   (a, b) => {
			if (a.explosive) a.explode();
			particleSystem.spawnParticle('hitmarker' + particleSystem.particles.length, p_brown_small, a.pos.x, a.pos.y, 10, 10, 3, random(0, 3), 5, 5);
			a.kill = true;
		});

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
			// Update array of bullets
			this.filterEntities('enemy');
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
	findEntityPath(e) {
		// easystar js
		if (!inRangeOf(e, e.target, g_tileSize*2)) {
			e.pathfinding = true;
			if (e.pathInstanceId != 'none') easystar.cancelPath(e.pathInstanceId);
			e.pathInstanceId = easystar.findPath(e.tile.x/g_tileSize, e.tile.y/g_tileSize, e.target.tile.x/g_tileSize, e.target.tile.y/g_tileSize, function(path) {
				if (path === null) {
					console.log("Path was not found. " + path);
				} else {
					e.dx = ((path[1].x - random(-1, 1)) * g_tileSize) - (e.pos.x);
					e.dy = ((path[1].y - random(-1, 1)) * g_tileSize) - (e.pos.y);
					e.angle = Math.atan2(e.dy, e.dx);
					e.rotation = averageNums(e.rotation, e.angle, e.rotationSpeed);
				}
			});
		} else {
			easystar.cancelPath(e.pathInstanceId);
			e.pathfinding = false;
		}
	}
}
