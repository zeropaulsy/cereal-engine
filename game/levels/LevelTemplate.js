// Level template, a minimal playable level built on the Level base class (engine/core/Level.js)
//
// To make a new level:
//   1. Copy this file, rename LevelTemplate and the name passed to super()
//   2. Add a script tag for it in index.html in the game section, before config.js
//   3. Start it with Game.setState(new YourLevel()), or set Game.startLevel in game/config.js
//
// Level handles the camera, managers, shake, spawners, death, pause, draw order
// and default controls. Override only the hooks you need, see Level.js for the
// full list of hooks, helpers and options.
class LevelTemplate extends Level {
	constructor() {
		super('level_template');
		// Image behind the canvas
		this.background = bg_windows_bliss;
		// Spawners get 0.01 ticks faster every frame, down to 10
		this.spawnRamp = 0.01;
		this.minSpawnTime = 10;
	}

	// Spawn everything the level starts with
	setup() {
		// Background drawn on the canvas, the first one added is shown
		this.addBackground('bg_windows_bliss', [bg_windows_bliss]);
		// Spawn player : spawnPlayer(sprite, x, y, width, height, health, speed, makeWeapons)
		this.spawnPlayer(spr_player_gates, width / 2, height - 64, 64, 64, 100, 7, (parent) => this.createWeapons(parent));
		// Enemy spawners on three screen edges : addSpawner(spawnTime, callback)
		this.addSpawner(55, () => { this.spawnEnemy('top'  ); });
		this.addSpawner(55, () => { this.spawnEnemy('left' ); });
		this.addSpawner(55, () => { this.spawnEnemy('right'); });
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
			new Gun('chicken_gun', spr_chicken_gun, p_chicken, parent, 24, 16, 1, 20, 1, 15, audio.mp3_hitmarker, p_hitmarker, false),
			new Gun('dorito_gun',  spr_dorito_gun,  p_dorito,  parent, 24, 24, 2, 10, 2, 25, audio.mp3_hitmarker, p_hitmarker, false)
		];
	}
	spawnEnemy(edge) {
		// Random point just off the given screen edge
		let p = this.edgePoint(edge);
		let size = 65;
		// Enemy(id, sprite, x, y, width, height, target, health, speed, friction, showHealthBar, death sound, score value)
		let enemy = new Enemy('enemy' + entityManager.entities.length, spr_steve, p.x, p.y, size, size, player, 10, random(1.2, 3), 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		enemy.hitbox.w = size / 1.5;
		// Spawn enemy
		entityManager.spawnEntity(enemy);
	}
}
