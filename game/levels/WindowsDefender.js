// WindowsDefender : the main level, built on the Level base class (engine/core/Level.js)
class WindowsDefender extends Level {
	constructor() {
		super('windows_defender');
		// Image behind the canvas
		this.background = bg_windows_bliss;
		// Snoop spawners get 0.01 ticks faster every frame, down to 10
		this.spawnRamp = 0.01;
		this.minSpawnTime = 10;

		this.bossSpawner = null;

		this.turretWorker = null;
		this.turretLookup = null;
		this.turretRequestPending = false;

		this.spooky = false;

		this.weaponIds = null;
		this.powerupSprites = [
			spr_misc_bag,
			spr_misc_bag,
			spr_misc_bag,
			spr_heart,
			spr_joint
		];
	}

	setup() {
		this.spooky = false;
		// Add turret worker thread
		this.turretWorker = new Worker('./engine/workers/CalculateAngle.js');
		this.setupTurretWorker();
		// Create backgrounds
		this.addBackground('bg_windows_bliss',   [bg_windows_bliss], 1);
		this.addBackground('bg_windows_98',      [bg_windows_98], 1);
		this.addBackground('bg_level_01_trippy', [bg_windows_bliss, bg_trip_full], 0.1, [gif_wormhole]);
		// Boss spawner, run in tick() so it isn't ramped up with the snoop spawners
		// EnemySpawner(max, spawnTime, spawnTimer, active, amount, callback)
		this.bossSpawner = new EnemySpawner(250, 500, 25, true, 1, () => {
			this.spawnAlert(width/2, -120, 420, 1000, 10);
		});
		// Snoop spawners
		this.addSpawner(55, () => { this.spawnWave('top'  ); });
		this.addSpawner(55, () => { this.spawnWave('left' ); });
		this.addSpawner(55, () => { this.spawnWave('right'); });
		// Spawn player with the chicken gun equipped
		this.spawnPlayer(spr_player_gates, width / 2, height - 64, 64, 64, 100, 7, (parent) => this.initializeWeapons(parent, 0));
		// Set additional weapon properties
		let dew_gun = player.inventory.getInventoryItem('dew_gun');
		// dew gun additional properties
		dew_gun.explosive = true;
		dew_gun.firerate = 3;
		dew_gun.p1 = p_explosion;
		dew_gun.p2 = spr_dew_logo;
		dew_gun.p3 = p_hitmarker;
		dew_gun.onEquip   = function() { music.mp3_skrillex.play(0, 0, true) }
		dew_gun.onHolster = function() { music.mp3_skrillex.stop() }
		// Get weapon IDs
		this.weaponIds = player.inventory.getContentIds();
		// Player starting velocity
		player.setVelocity(0, -25);
		// Spawn turret
		Game.bind('i', () => { this.spawnTurret() }, 'keydown');
		// Background script(s)
		Game.bind('y', () => { this.trippyMode(5000, 5, 1.25) }, 'keydown');
		Game.bind('u', () => { this.spookyMode(5000, 1) }, 'keydown');
	}
	cleanup() {
		// Close turret worker thread
		this.turretWorker.terminate();
		this.turretWorker = null;
		this.bossSpawner = null;
	}

	tick() {
		this.updateTurretWorker();

		this.bossSpawner.run();
		// Anti-camping, shake builds up after 500 frames without input
		if (inputTime > 500) {
			settings.shake += 0.55 * settings.speed;
		}
		// Set gif playback speed to global speed
		gif_tnt_exp.playSpeed = settings.speed;
	}
	drawWorld() {
		// FPS counter, moves with screen shake
		Game.c.font = '100px m3x6';
		Game.c.fillStyle = '#000';
		Game.c.fillText(Math.floor(fps), width - 52, 52);
		Game.c.fillStyle = '#ffff00';
		Game.c.fillText(Math.floor(fps), width - 50, 50);

		// Game.c.drawImage(spr_hypercam, (width / 2) - 105, 0, 210, 20);
	}
	drawHud() {
		Game.c.font = '50px Comic Sans MS';
		Game.c.fillStyle = '#000';
		Game.c.fillText('scubs rekt: ' + this.score, 12, 52);
		Game.c.fillStyle = '#fff';
		Game.c.fillText('scubs rekt: ' + this.score, 10, 50);
		Game.c.fillStyle = '#800000';
		Game.c.fillText('ign: ' + player.health / 10 + '/10', 12, 102);
		Game.c.fillStyle = '#ff0000';
		Game.c.fillText('ign: ' + player.health / 10 + '/10', 10, 100);
		Game.c.fillStyle = '#800000';
		Game.c.fillText('particles: ' + particleSystem.particles.length, 12, 152);
		Game.c.fillStyle = '#ff0000';
		Game.c.fillText('particles: ' + particleSystem.particles.length, 10, 150);

		if (inputTime > 500 && !settings.paused) {
			Game.c.font = '42pt Comic Sans MS';
			Game.c.textAlign = "center";
			Game.c.fillStyle = '#000'
			Game.c.fillText("stop camping", width / 2 + 2, height / 2 + 2);
			Game.c.fillStyle = '#fff'
			Game.c.fillText("stop camping", width / 2, height / 2);
		}
	}

	// Stage specific functions
	initializeWeapons(parent, slotEquipped) {
		let weapons = [];
		// Gun(id, gun sprite, bullet sprite, parent, bullet width, bullet height, amount, speed, dither, damage, hit sound, hit particle, equipped)
		weapons.push(new Gun('chicken_gun', spr_chicken_gun, p_chicken, parent, 24, 16, 1, 20, 1, 15, audio.mp3_hitmarker, p_hitmarker, false))
		weapons.push(new Gun('dorito_gun',  spr_dorito_gun,  p_dorito,  parent, 24, 24, 2, 10, 2, 25, audio.mp3_hitmarker, p_hitmarker, false))
		weapons.push(new Gun('banana_gun',  spr_banana_gun,  p_banana,  parent, 24, 24, 2, 15, 2, 20, audio.mp3_hitmarker, p_hitmarker, false))
		weapons.push(new Gun('dew_gun',     spr_dew_gun,     p_dew_can, parent, 24, 16, 2, 15, 2, 20, audio.mp3_hitmarker, p_hitmarker, false))

		weapons[slotEquipped].equipped = true;

		return weapons;
	}
	dropPowerup(parent) {
		let id = 'powerup' + entityManager.entities.length;
		let powerup = randomInt(1, 5);
		// Control inventory weapons
		let weapon = () => {
			let powerupTime = 5000;

			if (!player.powerupActive) {
				player.powerupActive = true;

				console.log(parent.id + ' picked up.');

				player.inventory.equipItem(this.weaponIds[powerup]);

				timerManager.addTimer(() => {
					player.inventory.equipItem(this.weaponIds[0]);
					player.powerupActive = false;
				}, powerupTime);

				return true;
			} else {
				return false;
			}
		}
		// Increase max health by 50
		let health = () => {
			player.setHealth(player.maxHealth + 50);
			audio.mp3_1up.play();

			return true;
		}
		// Trigger state event
		let slowmo = () => {
			audio.mp3_smoke_weed.play();
			this.trippyMode(5000, 5, 1.25);

			return true;
		}

		entityManager.spawnEntity(new Powerup(id, this.powerupSprites[powerup-1], parent.pos.x, parent.pos.y, 48, 48, function() {

			if (powerup <= 3) return weapon();
			if (powerup == 4) return health();
			if (powerup == 5) return slowmo();

		}));
	}
	dashEvent() {
		settings.shake += 5;
		// Dash explosion
		new Explosion(player.pos.x, player.pos.y, 8, 8, 10, 5, 5, 0, spr_dash_emoji, spr_lip_emoji, spr_hot_emoji);

		audio.mp3_fart.play(0, 0.1, true);

		timerManager.addTimer(function() {
			// Dash damage explosion
			new Explosion(player.pos.x, player.pos.y, 24, 24, 20, 10, 10, 50, p_explosion, spr_dew_logo, p_hitmarker);

			audio.mp3_vine_boom.play(0, 0.1, true);

			settings.shake -= 5;

		}, (player.dashVel * 25) / settings.speed);
	}
	trippyMode(time, shake, saturation) {
		backgroundManager.selectBackgroundScreen('bg_level_01_trippy', () => {
			// Apply filter to canvas
			Game.setFilter('--saturate', saturation);
			// Set shake amount
			settings.shake += shake;
			settings.speed  = 0.25;
			this.dampenShake = false;
			// Create timer to reset changes and refer to default backgound
			timerManager.addTimer(() => {
				Game.setFilter('--saturate', 1);
				// Only execute if game is still in current level
				if (Game.getCurrentState() == this) {
					backgroundManager.selectBackgroundScreen('bg_windows_bliss');
					settings.shake -= shake;
					settings.speed  = 1;
					this.dampenShake = true;
				}
			}, time);
		});
	}
	spookyMode(time, shake) {
		this.spooky = true;
		// Apply filter to canvas
		Game.setFilter('--grayscale', 1.0);
		Game.setFilter('--contrast',  1.5);
		// Set shake amount
		settings.shake += shake;
		// Disable shake dampening
		this.dampenShake = false;
		// Create timer to reset changes and refer to default backgound
		timerManager.addTimer(() => {
			Game.setFilter('--grayscale', 0);
			Game.setFilter('--contrast',  1);
			// Only execute if game is still in current level
			if (Game.getCurrentState() == this) {
				backgroundManager.selectBackgroundScreen('bg_windows_bliss');
				settings.shake -= shake;
				// Enable shake dampening
				this.dampenShake = true;
				this.spooky = false;
			}
		}, time);
	}
	spawnWave(edge) {
		// Random point just off the given screen edge
		let pos = this.edgePoint(edge);
		let ran = randomInt(0, 100);
		// Percentage chance of enemy spawning
		if (ran < 50) {
			if (!this.spooky) {
				this.spawnSnoop(pos.x, pos.y, 65, 10, random(1.2, 3));
			} else {
				this.spawnSkull(pos.x, pos.y, 65, 25, random(1.2, 3));
			}
		}
		if (ran < 25) {
			if (!this.spooky) {
				this.spawnSnoop(pos.x, pos.y, 95, 25, random(3.5, 5));
			} else {
				this.spawnSkull(pos.x, pos.y, 95, 50, random(3.5, 5));
			}
		}
		if (ran < 10) {
			this.spawnCreep(pos.x, pos.y, 100, 100, random(4.5, 6));
		}
	}
	setupTurretWorker() {
		this.turretLookup = new Map();
		this.turretRequestPending = false;
		// Apply aim angles returned by the worker to each turret by id
		this.turretWorker.onmessage = (e) => {
			for (let i = 0; i < e.data.length; i++) {
				let r = e.data[i];
				let turret = this.turretLookup.get(r.id);
				if (turret) turret.aimAngle = r.angle;
			}
			this.turretRequestPending = false;
		};
		// Don't stay stuck waiting on a reply that will never come
		this.turretWorker.onerror = (err) => {
			console.error('Turret worker error:', err.message);
			this.turretRequestPending = false;
		};
	}
	updateTurretWorker() {
		// Only one request in flight at a time so messages never queue up
		if (this.turretRequestPending) return;

		let turrets = [];
		let targetTypes = new Set();
		this.turretLookup = new Map();

		for (let i = 0; i < entityManager.entities.length; i++) {
			let e = entityManager.entities[i];
			if (e.entityType !== 'turret' || !e.inventory) continue;
			turrets.push({
				id: e.id,
				x: e.pos.x,
				y: e.pos.y,
				speed: e.inventory.getEquippedItem().speed,
				targetType: e.target
			});
			targetTypes.add(e.target);
			this.turretLookup.set(e.id, e);
		}
		if (turrets.length === 0) return;

		let targets = [];
		for (let i = 0; i < entityManager.entities.length; i++) {
			let e = entityManager.entities[i];
			if (!targetTypes.has(e.entityType)) continue;
			targets.push({ type: e.entityType, x: e.pos.x, y: e.pos.y, vx: e.vel.x, vy: e.vel.y });
		}

		this.turretWorker.postMessage({ turrets: turrets, targets: targets });
		this.turretRequestPending = true;
	}
	spawnTurret() {
		// Set ID
		let id = 'player_turret' + entityManager.entities.length;
		// Define turret
		let turret = new Turret(id, spr_player_gates, 'enemy', player.pos.x, player.pos.y, 55, 55, 50, 2, 100);
		// Spawn Turret
		entityManager.spawnEntity(turret);
		// Populate inventory
		turret.inventory = new Inventory(
			10,
			this.initializeWeapons(turret, 1)
		);
	}
	spawnSnoop(x, y, size, health, speed) {
		// Specify id
		let id = 'enemy' + entityManager.entities.length;
		// Define snoop
		let snoop = new Enemy(id, spr_steve, x, y, size, size, player, health, speed, 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		snoop.hitbox.w = size/1.5;
		// Spawn snoop
		entityManager.spawnEntity(snoop);
	}
	spawnCreep(x, y, size, health, speed) {
		// Specify id
		let id = 'enemy' + entityManager.entities.length;
		// Define creeper
		let creep = new Enemy(id, spr_creeper, x, y, size, size, player, health, speed, 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		creep.enableRotation = false;
		creep.faceTarget = true;
		creep.explosive = true;
		creep.hitmarker = spr_tnt;
		// Spawn creeper
		entityManager.spawnEntity(creep);
	}
	spawnSkull(x, y, size, health, speed) {
		// Specify id
		let id = 'enemy' + entityManager.entities.length;
		// Define skull
		let skull = new Enemy(id, spr_skull, x, y, size/1.25, size, player, health, speed, 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		skull.enableRotation = false;
		// Spawn skull
		entityManager.spawnEntity(skull);
	}
	spawnAlert(x, y, size, health, speed) {
		// Specify id
		let id = 'alert' + entityManager.entities.length;
		// Define enemy
		let alert = new Enemy(id, spr_alert_boss_1, x, y, size, size*0.29, player, 1000, speed, 0.875, false, audio.mp3_hitmarker, 10);
		// Set additional properties
		alert.sprite_dmg_enabled = true;
		alert.sprite_dmg_1 = spr_alert_boss_2;
		alert.sprite_dmg_2 = spr_alert_boss_3;
		alert.enableRotation = false;
		alert.hitmarker = spr_adblock;
		alert.hitbox.type = 1;
		alert.knockBack = 10;
		// Spawn enemy
		entityManager.spawnEntity(alert);
	}
}
