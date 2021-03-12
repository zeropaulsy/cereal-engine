var SnoopSlayer = function() {

	this.name = 'snoop_slayer';

	this.enemySpawnerTop;
	this.enemySpawnerLeft;
	this.enemySpawnerRight;

	this.score;

	this.camera;

	this.map = {
		cols: 20,
		rows: 11,
		tsize: 8,
		tiles: [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		],
		getTile: function(col, row) {
			return this.tiles[row * map.cols + col]
		}
	};

	this.onEnter = function() {
		// Set image rendering to nearest neighbour
		Game.c.imageSmoothingEnabled = true;
		// Set g variables
		g_tileSize = 64;
		g_shake = 0;
		g_shadows_enabled = false;
		g_pathfinding_enabled = false;

		Game.canvas.mouseX = width;
		Game.canvas.mouseY = height / 2;
		// Setup camera
		this.camera = new Camera(Game.c);
		this.camera.moveTo(Game.canvas.width / 2, Game.canvas.height / 2);
		this.camera.zoomTo(Game.canvas.width);
		// Setup pathfinding using this levels map
		easystar.setGrid(this.map.tiles);
		easystar.setAcceptableTiles([0, 9]);
		easystar.setTileCost(9, 10);
		easystar.enableDiagonals();
		easystar.enableSync();
		easystar.setIterationsPerCalculation(2000);

		backgroundManager = new BackgroundManager(10, 0);

		backgroundManager.screens.push(new BackgroundScreen('bg_windows_bliss', [bg_windows_bliss], 1));
		backgroundManager.screens.push(new BackgroundScreen('bg_level_01_trippy', [vid_tunnel, bg_trip_full, bg_windows_bliss], 0.1));

		entityManager = new EntityManager(5000);
		// Create map from tilemap
		for (var i = 0; i < this.map.tiles.length; i++) {
			for (var j = 0; j < this.map.tiles[i].length; j++) {
				if (this.map.tiles[i][j] == 1) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 16, 0, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
				if (this.map.tiles[i][j] == 2) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map,  8, 0, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
				if (this.map.tiles[i][j] == 3) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 24, 0, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
			}
		}
		// Create enemy spawners
		this.enemySpawnerTop = new EnemySpawner(250, 55, 25, true, function() {
			if (Math.round(random(0, 5)) != 5) {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_snoop, player, random(150, width - 150), -55, 55, 55, false, random(1.2, 3), 10, mp3_hitmarker, 1, spr_misc_bag);
			} else {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_snoop, player, random(150, width - 150), -80, 80, 80, false, random(4, 5), 25, mp3_hitmarker, 1, spr_misc_bag);
			}
		}, 1);

		this.enemySpawnerLeft = new EnemySpawner(250, 75, 25, true, function() {
			if (Math.round(random(0, 1)) == 0) {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_snoop, player, -45, random(150, height - 150), 55, 55, false, random(1.2, 3), 10, mp3_hitmarker, 1, spr_misc_bag);
			} else {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_snoop, player, -45, random(150, height - 150), 80, 80, false, random(3, 4), 25, mp3_hitmarker, 1, spr_misc_bag);
			}
		}, 1);

		this.enemySpawnerRight = new EnemySpawner(250, 75, 25, true, function() {
			if (Math.round(random(0, 1)) == 0) {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_snoop, player, width + 45, random(150, height - 150), 55, 55, false, random(1.2, 3), 10, mp3_hitmarker, 1, spr_misc_bag);
			} else {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_snoop, player, width + 45, random(150, height - 150), 80, 80, false, random(3, 4), 25, mp3_hitmarker, 1, spr_misc_bag);
			}
		}, 1);

		particleSystem = new ParticleSystem(2000);

		// Create player entity and initialize instructions
		entityManager.spawnPlayer('player', spr_player_slayer, width / 2, height - 75, 85, 85, 7, 0.875, 15);
		// Assign player entity to global varible for ease of use
		player = entityManager.getEntityById('player');
		// Add weapons to inventory (id, gun sprite, bullet sprite, parent, width, height, amount, speed, dither, damage, hit sound, hit particle, eqipped)
		player.inventory.contents.push(new Gun('chicken_gun', spr_chicken_gun, p_chicken, player, player.width, player.height, 24, 16, 1, 20, 1, 15, mp3_hitmarker, p_hitmarker, true));

		player.inventory.contents.push(new Gun('dorito_gun', spr_dorito_gun, p_dorito, player, player.width, player.height, 24, 24, 2, 10, 2, 25, mp3_hitmarker, p_hitmarker, false));

		player.inventory.contents.push(new Gun('banana_gun', spr_banana_gun, p_banana, player, player.width, player.height, 24, 24, 2, 15, 2, 20, mp3_hitmarker, p_hitmarker, false));

		player.inventory.contents.push(new Gun('dew_gun', spr_dew_gun, p_dew_can, player, player.width, player.height, 24, 16, 2, 15, 2, 20, mp3_hitmarker, p_hitmarker, false));
		player.inventory.contents[3].explosive = true;
		player.inventory.contents[3].firerate = 3;
		// Player starting velocity
		player.vel.x =   0;
		player.vel.y = -25;

		this.score = 0;

		this.initializeControls();

		console.log(this.name + ' entered.');

	}
	this.onExit = function() {
		// CLose turret worker threads
		for (let i = 0; i < entityManager.turrets.length; i++) {
			entityManager.turrets[i].worker.terminate();
		}

		// Destroy enemy spawners
		this.enemySpawnerTop = null;
		this.enemySpawnerLeft = null;
		this.enemySpawnerRight = null;

		// Reset managers
		backgroundManager = null;
		entityManager = null;
		particleSystem = null;

		// Reset player
		player = null;

		// Add level score to global score
		score += this.score;
		g_shake = 0;

		// Reset controls
		Object.keys(controls).forEach(function(key) {
			Mousetrap.bind(controls[key], function() {}, 'keydown');
		});

		Mousetrap.bind('i', function() {}, 'keydown');
		Mousetrap.bind('t', function() {}, 'keydown');
		Mousetrap.bind('y', function() {}, 'keydown');

		console.log(this.name + ' left.');
	}

	this.update = function() {

		// this.camera.moveTo(player.pos.x * g_scale, player.pos.y * g_scale);
		this.camera.moveTo(Game.canvas.width / 2, Game.canvas.height / 2);
		this.camera.zoomTo(Game.canvas.width);

		this.enemySpawnerTop.run();
		this.enemySpawnerLeft.run();
		this.enemySpawnerRight.run();

		if ( this.enemySpawnerTop.spawnTime   > 10 ) this.enemySpawnerTop.spawnTime   -= 0.01;
		if ( this.enemySpawnerLeft.spawnTime  > 10 ) this.enemySpawnerLeft.spawnTime  -= 0.01;
		if ( this.enemySpawnerRight.spawnTime > 10 ) this.enemySpawnerRight.spawnTime -= 0.01;

		if (g_pathfinding_enabled) easystar.calculate();

	}
	this.display = function() {

		this.camera.begin();

		Game.c.save();

		Game.c.scale(g_scale, g_scale);

		Game.c.translate(random(-g_shake, g_shake), random(-g_shake, g_shake));

		if (!g_paused) {

			backgroundManager.run();

			entityManager.run();

			if (g_particles_enabled) particleSystem.run();

			Game.c.save();

		    Game.c.translate(Game.canvas.mouseX, Game.canvas.mouseY);
			Game.c.drawImage(cur_pixel, -20, -20, 40, 40);

			Game.c.restore();
		}

		// Draw HUD
		Game.c.font = '50px Comic Sans MS';
		Game.c.fillStyle = '#ff0000';
		Game.c.fillText('fps: ' + Math.floor(fps), 10, 50);
		Game.c.fillStyle = 'white';
		Game.c.fillText('enemies: ' + entityManager.enemies.length, 10, 100);
		Game.c.fillStyle = '#ffff00';
		Game.c.fillText('score: ' + this.score, 10, 150);

		Game.c.restore();

		this.camera.end();

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

		Mousetrap.bind( controls.right, () => { rightPressed = true; }, 'keydown' );
		Mousetrap.bind( controls.right, () => { rightPressed = false; }, 'keyup'  );

		Mousetrap.bind( controls.space, () => { spacePressed = true; }, 'keydown' );
		Mousetrap.bind( controls.space, () => { spacePressed = false, player.dash(player.dashVel) }, 'keyup'  );

		Mousetrap.bind( controls.inv1,  () => { player.inventory.selectSlot(0); }, 'keydown' );
		Mousetrap.bind( controls.inv2,  () => { player.inventory.selectSlot(1); }, 'keydown' );
		Mousetrap.bind( controls.inv3,  () => { player.inventory.selectSlot(2); }, 'keydown' );
		Mousetrap.bind( controls.inv4,  () => { player.inventory.selectSlot(3); }, 'keydown' );
		Mousetrap.bind( controls.inv5,  () => { player.inventory.selectSlot(4); }, 'keydown' );

		Mousetrap.bind('t', () => { new Explosion(player.pos.x, player.pos.y, 24, 24, 15, 10, 10) }, 'keyup');

		// Spawn bot
		Mousetrap.bind('i', () => {
			entityManager.spawnTurret(
				'player_turret' + entityManager.turrets.length,
				spr_player_slayer,
				entityManager.enemies,
				player.pos.x - player.width/2,
				player.pos.y - player.width/2,
				80/1.25, 75/1.25,
				25, 25,
				random(0.75, 0.9),
				false,
				'staff02'
			);
		}, 'keydown');

		// Background script(s)
		Mousetrap.bind('y', () => {
			let _this = this;
			backgroundManager.selectBackgroundScreen('bg_level_01_trippy', function() {
				// Apply filter to canvas
				document.getElementById('body').style.filter = 'saturate(1.2)';
				// Set shake amount
				g_shake = 1;
				// Start video
				vid_tunnel.play();
				// Create timer to reset changes and refer to default backgound
				let timer = new Timer(function() {
					// Only execute if game is still in current level
					if (Game.getCurrentState() == _this) {
						document.getElementById('body').style.filter = '';
						backgroundManager.selectBackgroundScreen('bg_windows_bliss');
						g_shake = 0;
						vid_tunnel.pause();
					}
				}, 6000);
			});
		}, 'keydown');
	}
}
