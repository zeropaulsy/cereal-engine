var WindowsDefender = function() {
	let self = this;

	this.name = 'windows_defender';
	this.loading = true;

	this.bossSpawnerTop;
	this.snoopSpawnerTop;
	this.snoopSpawnerLeft;
	this.snoopSpawnerRight;

	this.turrentWorker;

	this.dampenShake = true;
	this.spooky = false;

	this.weaponIds;
	this.weapons = [];
	this.powerupSprites = [
		spr_misc_bag, 
		spr_misc_bag, 
		spr_misc_bag, 
		spr_heart,
		spr_joint
	];

	this.score;

	this.camera;

	this.onEnter = function() {
		this.loading = true;
		console.time('Windows Defender loading');
		// Generate shadows
		console.time('Generate Shadows');
		// Sprites
		spr_player_gates.shadow  = generateShadow(spr_player_gates);
		spr_steve.shadow 		 = generateShadow(spr_steve);
		spr_skull.shadow 		 = generateShadow(spr_skull);
		spr_creeper.shadow 		 = generateShadow(spr_creeper);
		spr_alert_boss_1.shadow  = generateShadow(spr_alert_boss_1);
		spr_alert_boss_2.shadow  = generateShadow(spr_alert_boss_2);
		spr_alert_boss_3.shadow  = generateShadow(spr_alert_boss_3);
		spr_misc_bag.shadow      = generateShadow(spr_misc_bag);
		spr_heart.shadow         = generateShadow(spr_heart);
		spr_joint.shadow         = generateShadow(spr_joint);
		// Particles
		p_chicken.shadow  = generateShadow(p_chicken);
		p_dew_can.shadow  = generateShadow(p_dew_can);
		p_dorito.shadow   = generateShadow(p_dorito );
		p_banana.shadow   = generateShadow(p_banana );
		console.timeEnd('Generate Shadows');
		// Set html body background
		body.style.backgroundImage = 'url(' + bg_windows_bliss.src + ')';
		// Set image rendering mode
		Game.c.imageSmoothingEnabled = true;
		Game.canvas.style.cursor = 'none';
		// Set mouse position
		Game.canvas.mouse.x = width;
		Game.canvas.mouse.y = height / 2;
		// Add turret worker thread
		this.turretWorker = new Worker('./game/CalculateAngle.js');
		// Set global variables
		g_speed = 1;
		g_tileSize = 64;
		g_shake = 0;
		g_shadows_enabled = false;
		g_pathfinding_enabled = false;
		inputTime = 0;
		// Create audio groups if undefined
		if (!audioLoaded) {
			createAudioGroup(audio, audioArray);
			createAudioGroup(music, musicArray);
			audioLoaded = true;
		}
		// Setup camera
		this.camera = new Camera(Game.c);
		this.camera.moveTo(Game.canvas.width / 2, Game.canvas.height / 2);
		this.camera.zoomTo(Game.canvas.width);
		// Define the backgound manager
		backgroundManager = new BackgroundManager(10, 0);
		// Create backgrounds
		backgroundManager.screens.push(new BackgroundScreen('bg_windows_bliss', [bg_windows_bliss], 1));
		backgroundManager.screens.push(new BackgroundScreen('bg_windows_98', [bg_windows_98], 1));
		backgroundManager.screens.push(new BackgroundScreen('bg_level_01_trippy', [bg_windows_bliss, bg_trip_full], 0.1, [gif_wormhole]));
		// Define the entity manager
		entityManager = new EntityManager(5000);
		// Create enemy spawners
		this.bossSpawnerTop = new EnemySpawner(250, 500, 25, true, 1, function() {
			self.spawnAlert(width/2, -120, 420, 1000, 10);
		});
		this.snoopSpawnerTop   = this.createSnoopSpawner('top'  );
		this.snoopSpawnerLeft  = this.createSnoopSpawner('left' );
		this.snoopSpawnerRight = this.createSnoopSpawner('right');
		// Create particle system
		particleSystem = new ParticleSystem(1000);
		// Spawn player and initialize instructions
		entityManager.spawnEntity(new Player('player', spr_player_gates, width / 2, height - 85, 85, 85, 100, 7));
		// Assign player entity to global varible for ease of use
		player = entityManager.getEntityById('player');
		// Create player inventory
		player.inventory = new Inventory( 10, this.initializeWeapons(player, 0) );
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
		// Reset score
		this.score = 0;

		this.initializeControls();

		console.log(this.name + ' entered.');

		console.timeEnd('Windows Defender loading');
		this.loading = false;
	}
	this.onExit = function() {
		// CLose turret worker thread
		this.turretWorker.terminate();

		// Destroy camera
		this.camera = null;

		// Destroy enemy spawners
		this.bossSpawnerTop = null;
		this.snoopSpawnerTop = null;
		this.snoopSpawnerLeft = null;
		this.snoopSpawnerRight = null;

		// Reset managers
		backgroundManager = null;
		entityManager = null;
		particleSystem = null;

		// Reset player
		player = null;

		// Add level score to global score
		score = this.score;
		g_shake = 0;
		g_speed = 1;
		inputTime = 0;

		// Stop all audio
		audio.Group.stop();
		music.Group.stop();

		// Reset controls
		Object.keys(controls).forEach(function(key) {
			Mousetrap.unbind(controls[key], 'keydown');
		});

		Mousetrap.unbind( 'i',  'keydown');
		Mousetrap.unbind( 't',  'keydown');
		Mousetrap.unbind( 'y',  'keydown');
		Mousetrap.unbind('esc', 'keydown');

		console.log(this.name + ' left.');
	}
	this.onDeath = function() {
		lastScreen = canvasDataToImage(Game.canvas);

		Game.setState(new DeathScreen01());
	}
	this.restart = function () {
		this.onExit();
		this.onEnter();
	}

	this.update = function() {

		if (g_shake !== 0 && !g_paused) {
			this.camera.moveTo(
				(Game.canvas.width  / 2) + random(-g_shake, g_shake), 
				(Game.canvas.height / 2) + random(-g_shake, g_shake)
			);
		} else {
			this.camera.moveTo(
				(Game.canvas.width  / 2), 
				(Game.canvas.height / 2)
			);
		}
		this.camera.zoomTo(Game.canvas.width - (g_shake * 3));

		// this.bossSpawnerTop.run();

		// this.snoopSpawnerTop.run();
		// this.snoopSpawnerLeft.run();
		// this.snoopSpawnerRight.run();

		if ( this.snoopSpawnerTop.spawnTime   > 10 ) this.snoopSpawnerTop.spawnTime   -= 0.01;
		if ( this.snoopSpawnerLeft.spawnTime  > 10 ) this.snoopSpawnerLeft.spawnTime  -= 0.01;
		if ( this.snoopSpawnerRight.spawnTime > 10 ) this.snoopSpawnerRight.spawnTime -= 0.01;

		if (player.health <= 1) {
			this.onDeath();
		}

		inputTime++;
		if (inputTime > 500) {
			// g_shake += 0.55 * g_speed;
		}

		if (g_shake > 0 && this.dampenShake) g_shake -= 0.5;

		if (g_shake < 0) g_shake = 0;

		// Set gif playback speed to global speed
		gif_tnt_exp.playSpeed = g_speed;

	}
	this.display = function() {

		this.camera.begin();

		Game.c.save();

		Game.c.scale(g_scale, g_scale);

		if (!g_paused) {

			backgroundManager.run();

			entityManager.run();

			if (g_particles_enabled) particleSystem.run();

			Game.c.save();

		    Game.c.translate(Game.canvas.mouse.x, Game.canvas.mouse.y);
			Game.c.drawImage(cur_pixel, -20, -20, 40, 40);

			Game.c.restore();

			Game.c.font = '100px m3x6';
			Game.c.fillStyle = '#000';
			Game.c.fillText(Math.floor(fps), width - 52, 52);
			Game.c.fillStyle = '#ffff00';
			Game.c.fillText(Math.floor(fps), width - 50, 50);

			// Game.c.drawImage(spr_hypercam, (width / 2) - 105, 0, 210, 20);
		}

		Game.c.restore();

		this.camera.end();

		// Render ontop on the game
		Game.c.save();

		Game.c.scale(g_scale, g_scale);

		// Draw HUD
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

		if (inputTime > 500 && !g_paused) {
			Game.c.font = '42pt Comic Sans MS';
			Game.c.textAlign = "center";
			Game.c.fillStyle = '#000'
			Game.c.fillText("stop camping", width / 2 + 2, height / 2 + 2);
			Game.c.fillStyle = '#fff'
			Game.c.fillText("stop camping", width / 2, height / 2);
		}

		Game.c.restore();

	}

	this.onPause  = function() {
		Game.showPauseMenu();
	}
	this.onResume = function() {
		Game.hidePauseMenu();
		canvas.style.cursor = 'none';
	}

	this.initializeControls = function() {
		// Player controls
		Mousetrap.bind( controls.up,    () => { upPressed    = true;  },'keydown' );
		Mousetrap.bind( controls.up,    () => { upPressed    = false; }, 'keyup'  );

		Mousetrap.bind( controls.left,  () => { leftPressed  = true;  },'keydown' );
		Mousetrap.bind( controls.left,  () => { leftPressed  = false; }, 'keyup'  );

		Mousetrap.bind( controls.down,  () => { downPressed  = true;  },'keydown' );
		Mousetrap.bind( controls.down,  () => { downPressed  = false; }, 'keyup'  );

		Mousetrap.bind( controls.right, () => { rightPressed = true;  },'keydown' );
		Mousetrap.bind( controls.right, () => { rightPressed = false; }, 'keyup'  );

		Mousetrap.bind( controls.space, () => { spacePressed = true, this.playerDashEvent(); }, 'keydown' );
		Mousetrap.bind( controls.space, () => { spacePressed = false; }, 'keyup' );

		Mousetrap.bind( controls.inv1,  () => { player.inventory.selectSlot(0); }, 'keydown' );
		Mousetrap.bind( controls.inv2,  () => { player.inventory.selectSlot(1); }, 'keydown' );
		Mousetrap.bind( controls.inv3,  () => { player.inventory.selectSlot(2); }, 'keydown' );
		Mousetrap.bind( controls.inv4,  () => { player.inventory.selectSlot(3); }, 'keydown' );

		// Spawn turret
		Mousetrap.bind('i', () => { this.spawnTurret() }, 'keydown');

		// Background script(s)
		Mousetrap.bind('y', () => { this.trippyMode(5000, 5, 1.25) }, 'keydown');
		Mousetrap.bind('u', () => { this.spookyMode(5000, 1) }, 'keydown');

		Mousetrap.bind('esc', () => { Game.pauseGame() }, 'keydown');
	}

	// Stage specific functions
	this.initializeWeapons = function(parent, slotEquipped) {
		let weapons = [];

		weapons.push(new Gun('chicken_gun', spr_chicken_gun, p_chicken, parent, 24, 16, 1, 20, 1, 15, audio.mp3_hitmarker, p_hitmarker, false))
		weapons.push(new Gun('dorito_gun',  spr_dorito_gun,  p_dorito,  parent, 24, 24, 2, 10, 2, 25, audio.mp3_hitmarker, p_hitmarker, false))
		weapons.push(new Gun('banana_gun',  spr_banana_gun,  p_banana,  parent, 24, 24, 2, 15, 2, 20, audio.mp3_hitmarker, p_hitmarker, false))
		weapons.push(new Gun('dew_gun',     spr_dew_gun,     p_dew_can, parent, 24, 16, 2, 15, 2, 20, audio.mp3_hitmarker, p_hitmarker, false))

		weapons[slotEquipped].equipped = true;

		return weapons;
	}
	this.dropPowerup = function(parent) {
		let id = 'powerup' + entityManager.entities.length;
		let powerup = randomInt(1, 5);
		// Control inventory weapons
		function weapon() {
			let powerupTime = 5000;

			if (!player.powerupActive) {
				player.powerupActive = true;

				console.log(parent.id + ' picked up.');

				player.inventory.equipItem(Game.getCurrentState().weaponIds[powerup]);

				timerManager.addTimer(function() {
					player.inventory.equipItem(Game.getCurrentState().weaponIds[0]);
					player.powerupActive = false;
				}, powerupTime);

				return true;
			} else {
				return false;
			}
		}
		// Increase max health by 50
		function health() {
			player.setHealth(player.maxHealth + 50);
			audio.mp3_1up.play();

			return true;
		}
		// Trigger state event
		function slowmo() {
			audio.mp3_smoke_weed.play();
			Game.getCurrentState().trippyMode(5000, 5, 1.25);

			return true;
		}

		entityManager.spawnEntity(new Powerup(id, this.powerupSprites[powerup-1], parent.pos.x, parent.pos.y, 48, 48, function() {

			if (powerup <= 3) return weapon();
			if (powerup == 4) return health();
			if (powerup == 5) return slowmo();

		}));
	}
	this.playerDashEvent = function() {
		player.dash(player.dashVel, function() {
			g_shake += 5;
			// Dash explosion
			new Explosion(player.pos.x, player.pos.y, 8, 8, 10, 5, 5, 0, spr_dash_emoji, spr_lip_emoji, spr_hot_emoji);

			audio.mp3_fart.play(0, 0.1, true);

			timerManager.addTimer(function() {
				// Dash damage explosion
				new Explosion(player.pos.x, player.pos.y, 24, 24, 20, 10, 10, 50, p_explosion, spr_dew_logo, p_hitmarker);

				audio.mp3_vine_boom.play(0, 0.1, true);

				g_shake -= 5;

			}, (player.dashVel * 25) / g_speed);
		});
	}
	this.trippyMode = function(time, shake, saturation) {
		backgroundManager.selectBackgroundScreen('bg_level_01_trippy', function() {
			// Apply filter to canvas
			Game.setFilter('--saturate', saturation);
			// Set shake amount
			g_shake += shake;
			g_speed  = 0.25;
			self.dampenShake = false;
			// Create timer to reset changes and refer to default backgound
			timerManager.addTimer(function() {
				Game.setFilter('--saturate', 1);
				// Only execute if game is still in current level
				if (Game.getCurrentState() == self) {
					backgroundManager.selectBackgroundScreen('bg_windows_bliss');
					g_shake -= shake;
					g_speed  = 1;
					self.dampenShake = true;
				}
			}, time);
		});
	}
	this.spookyMode = function(time, shake) {
		this.spooky = true;
		// Apply filter to canvas
		Game.setFilter('--grayscale', 1.0);
		Game.setFilter('--contrast',  1.5);
		// Set shake amount
		g_shake += shake;
		// Disable shake dampening
		this.dampenShake = false;
		// Create timer to reset changes and refer to default backgound
		timerManager.addTimer(function() {
			Game.setFilter('--grayscale', 0);
			Game.setFilter('--contrast',  1);
			// Only execute if game is still in current level
			if (Game.getCurrentState() == self) {
				backgroundManager.selectBackgroundScreen('bg_windows_bliss');
				g_shake -= shake;
				// Enable shake dampening
				self.dampenShake = true;
				self.spooky = false;
			}
		}, time);
	}
	this.createSnoopSpawner = function(edge) {
		// max, spawnTime, spawnTimer, active, amount, callback
		return new EnemySpawner(250, 55, 25, true, 1, function() {
			// Set spawn point and generate random int
			let pos = new Vector();
			let ran = randomInt(0, 100);
			// Top
			if (edge == 'top') {
				pos.x = randomInt(150, width - 150);
				pos.y = -80;
			}
			// Left
			if (edge == 'left') {
				pos.x = -80;
				pos.y = randomInt(150, height - 150);
			}
			// Right
			if (edge == 'right') {
				pos.x = randomInt(width, width + 80);
				pos.y = randomInt(150, height - 150);
			}
			// Percentage chance of enemy spawning
			if (ran < 50) {
				if (!self.spooky) {
					self.spawnSnoop(pos.x, pos.y, 65, 10, random(1.2, 3));
				} else {
					self.spawnSkull(pos.x, pos.y, 65, 25, random(1.2, 3));
				}
			} 
			if (ran < 25) {
				if (!self.spooky) {
					self.spawnSnoop(pos.x, pos.y, 95, 25, random(3.5, 5));
				} else {
					self.spawnSkull(pos.x, pos.y, 95, 50, random(3.5, 5));
				}
			}
			if (ran < 10) {
				self.spawnCreep(pos.x, pos.y,100,100, random(4.5, 6));
			}
		});
	}
	this.spawnTurret = function() {
		// Set ID
		let id = 'player_turret' + entityManager.entities.length;
		// Define turret
		let turret = new Turret(id, spr_player_slayer, 'enemy', player.pos.x, player.pos.y, 55, 55, 50, 2, 100);
		// Spawn Turret
		entityManager.spawnEntity(turret);
		// Populate inventory
		turret.inventory = new Inventory(
			10,
			this.initializeWeapons(turret, 1) 
		);
	}
	this.spawnSnoop = function(x, y, size, health, speed) {
		// Specify id
		let id = 'enemy' + entityManager.entities.length;
		// Define snoop
		let snoop = new Enemy(id, spr_steve, x, y, size, size, player, health, speed, 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		snoop.hitbox.w = size/1.5;
		// Spawn snoop
		entityManager.spawnEntity(snoop);
	}
	this.spawnCreep = function(x, y, size, health, speed) {
		// Specify id
		let id = 'enemy' + entityManager.entities.length;
		// Define snoop
		let creep = new Enemy(id, spr_creeper, x, y, size, size, player, health, speed, 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		creep.enableRotation = false;
		creep.faceTarget = true;
		creep.explosive = true;
		creep.hitmarker = spr_tnt;
		// Spawn snoop
		entityManager.spawnEntity(creep);
	}
	this.spawnSkull = function(x, y, size, health, speed) {
		// Specify id
		let id = 'enemy' + entityManager.entities.length;
		// Define skull
		let skull = new Enemy(id, spr_skull, x, y, size/1.25, size, player, health, speed, 0.875, false, audio.mp3_hitmarker, 1);
		// Set additional properties
		skull.enableRotation = false;
		// Spawn skull
		entityManager.spawnEntity(skull);
	}
	this.spawnAlert = function(x, y, size, health, speed) {
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
