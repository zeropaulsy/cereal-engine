// Reskin : Reskin()
// A pixel art reskin of the arena, built on the Level base class (game/Level.js)
class Reskin extends Level {
	constructor() {
		super('reskin');
		// Image behind the canvas
		this.background = bg_level_01;
		// Spawners get 0.01 ticks faster every frame, down to 10
		this.spawnRamp = 0.01;
		this.minSpawnTime = 10;
	}

	// Spawn everything the level starts with
	setup() {
		// Background drawn on the canvas, the first one added is shown
		this.addBackground('bg_level_01', [bg_level_01]);
		// Spawn player : spawnPlayer(sprite, x, y, width, height, health, speed, makeWeapons)
		this.spawnPlayer(spr_player_01, width / 2, height - 74, 74, 74, 100, 7, (parent) => this.createWeapons(parent));
		player.inventory.getInventoryItem('bow').explosive = true;
		player.inventory.getInventoryItem('bow').firerate  = 15;
		// Enemy spawners on three screen edges : addSpawner(spawnTime, callback)
		this.addSpawner(75, () => { this.spawnEnemy('top'  ); });
		this.addSpawner(75, () => { this.spawnEnemy('left' ); });
		this.addSpawner(75, () => { this.spawnEnemy('right'); });
	}

	// Draw on top of the game in screen space
	drawHud() {
		Game.c.font = '50px Comic Sans MS';
		Game.c.fillStyle = '#000';
		Game.c.fillText('score: ' + this.score, 12, 52);
		Game.c.fillStyle = '#fff';
		Game.c.fillText('score: ' + this.score, 10, 50);
		Game.c.fillStyle = '#800000';
		Game.c.fillText('health: ' + player.health, 12, 102);
		Game.c.fillStyle = '#ff0000';
		Game.c.fillText('health: ' + player.health, 10, 100);
	}

	// Called by Enemy on death, chance set by settings.powerupDropRate
	dropPowerup(enemy) {
		let id = 'powerup' + entityManager.entities.length;
		// Powerup(id, sprite, x, y, width, height, onCollision), return true from onCollision to consume it
		entityManager.spawnEntity(new Powerup(id, spr_heart, enemy.pos.x, enemy.pos.y, 48, 48, function() {
			// Increase max health by 50
			player.setHealth(player.maxHealth + 50);
			audio.mp3_1up.play();

			return true;
		}));
	}

	// Called when the player dashes (Space)
	dashEvent() {
		settings.shake += 5;
		// Dash explosion : Explosion(x, y, particle width, particle height, amount, range, dither, damage, p1, p2, p3)
		new Explosion(player.pos.x, player.pos.y, 24, 24, 20, 10, 10, 50, p_explosion, p_explosion, p_hitmarker);
	}

	// Stage specific functions
	createWeapons(parent) {
		// Gun(id, gun sprite, bullet sprite, parent, bullet width, bullet height, amount, speed, dither, damage, hit sound, hit particle, equipped)
		return [
			new Gun('pistol', spr_staff_blue, p_blue,   parent, 16, 16, 1, 20, 1, 15, audio.mp3_hitmarker, p_red_small, false),
			new Gun('smg',    spr_staff_red,  p_orange, parent, 16, 16, 2, 10, 2, 25, audio.mp3_hitmarker, p_red_small, false),
			new Gun('bow',    spr_bow_01,  	  spr_bomb, parent, 70, 60, 1, 10, 1, 25, audio.mp3_hitmarker, p_red_small, false),
		];
	}
	spawnEnemy(edge) {
		let r = random(0, 100);
		// Half zombies, half skulls, plus a grunt 25% of the time
		if (r < 50) {
			this.spawnZombie(edge);
		} else {
			this.spawnSkull(edge);
		}
		if (r < 25) this.spawnGrunt(edge);
	}
	spawnZombie(edge) {
		// Random point just off the given screen edge
		let p = this.edgePoint(edge);
		// Enemy(id, sprite, x, y, width, height, target, health, speed, friction, showHealthBar, death sound, score value)
		let enemy = new Enemy('enemy' + entityManager.entities.length, spr_enemy_02, p.x, p.y, 60, 75, player, 40, random(2.2, 4), 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		enemy.hitbox.w = 75 / 1.5;
		enemy.enableRotation = false;
		enemy.faceTarget = true;
		enemy.hitmarker = p_red_small;
		// Spawn enemy
		entityManager.spawnEntity(enemy);
	}
	spawnGrunt(edge) {
		// Random point just off the given screen edge
		let p = this.edgePoint(edge);
		// Enemy(id, sprite, x, y, width, height, target, health, speed, friction, showHealthBar, death sound, score value)
		let enemy = new Enemy('enemy' + entityManager.entities.length, spr_enemy_03, p.x, p.y, 100, 140, player, 80, random(6.2, 8), 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		enemy.hitbox.w = 140 / 1.5;
		enemy.enableRotation = false;
		enemy.faceTarget = true;
		enemy.hitmarker = p_red_small;
		// Spawn enemy
		entityManager.spawnEntity(enemy);
	}
	spawnSkull(edge) {
		// Random point just off the given screen edge
		let p = this.edgePoint(edge);
		let size = 48;
		// Enemy(id, sprite, x, y, width, height, target, health, speed, friction, showHealthBar, death sound, score value)
		let enemy = new Enemy('enemy' + entityManager.entities.length, spr_enemy, p.x, p.y, size, size, player, 1, random(1.2, 3), 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		enemy.hitbox.w = size / 1.5;
		enemy.enableRotation = false;
		enemy.faceTarget = true;
		enemy.hitmarker = p_red_small;
		// Spawn enemy
		entityManager.spawnEntity(enemy);
	}
}
