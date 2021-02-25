var Level02 = function() {

	this.name = 'level02';

	this.enemySpawnerTop;
	this.enemySpawnerLeft;
	this.enemySpawnerRight;

	this.score;

	this.map = {
		cols: 20,
		rows: 11,
		tsize: 8,
		tiles: [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 1],
			[2, 9, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 9, 2],
			[0, 0, 0, 9, 1, 1, 9, 0, 0, 0, 0, 0, 0, 9, 1, 1, 9, 0, 0, 0],
			[0, 0, 0, 9, 4, 4, 9, 0, 0, 0, 0, 0, 0, 9, 4, 4, 9, 0, 0, 0],
			[0, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 0],
			[3, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 3],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		],
		getTile: function(col, row) {
			return this.tiles[row * map.cols + col]
		}
	};

	this.onEnter = function() {
		width = Game.canvas.width;
		height = Game.canvas.height;
		// Set g variables
		g_tileSize = 64;
		g_shake = 0;
		// Setup pathfinding using this levels map
		easystar.setGrid(this.map.tiles);
		easystar.setAcceptableTiles([0, 9]);
		easystar.setTileCost(9, 10);
		easystar.enableDiagonals();
		easystar.setIterationsPerCalculation(1000);

		backgroundManager = new BackgroundManager(10, 0);

		backgroundManager.screens.push(new BackgroundScreen('bg_level_02', [bg_level_02], 1));
		backgroundManager.screens.push(new BackgroundScreen('bg_level_02_trippy', [vid_tunnel, bg_trip, bg_level_02], 0.1));

		entityManager = new EntityManager(5000);
		// Create map from tilemap
		for (var i = 0; i < this.map.tiles.length; i++) {
			for (var j = 0; j < this.map.tiles[i].length; j++) {
				if (this.map.tiles[i][j] == 1) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 4*8, 10*8, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
				if (this.map.tiles[i][j] == 2) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 7*8, 11*8, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
				if (this.map.tiles[i][j] == 3) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 2*8, 12*8, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
				if (this.map.tiles[i][j] == 4) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 1*8, 13*8, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
			}
		}
		// Create enemy spawners
		this.enemySpawnerTop = new EnemySpawner(50, 60, 105, true, function() {
			if (Math.round(random(0, 5)) != 5) {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy, player, width / 2, -25, 50, 55, false, random(1.2, 2), 10, mp3_hitmarker, 1);
			} else {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy_03, player, width / 2, -25, 100, 130, true, random(6, 7), 250, mp3_hitmarker, 1);
			}
		}, 1);

		this.enemySpawnerLeft = new EnemySpawner(50, 65, 105, true, function() {
			if (Math.round(random(0, 1)) == 0) {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy, player, 0, 346, 50, 55, false, random(1.2, 2), 10, mp3_hitmarker, 1);
			} else {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy_02, player, 0, 346, 60, 80, false, random(3, 4), 25, mp3_hitmarker, 1);
			}
		}, 1);

		this.enemySpawnerRight = new EnemySpawner(50, 60, 105, true, function() {
			if (Math.round(random(0, 1)) == 0) {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy, player, width + 45, 346, 50, 55, false, random(1.2, 2), 10, mp3_hitmarker, 1);
			} else {
				entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy_02, player, width + 45, 346, 60, 80, false, random(3, 4), 25, mp3_hitmarker, 1);
			}
		}, 1);

		particleSystem = new ParticleSystem(2000);

		// Create player entity and initialize instructions
		entityManager.spawnPlayer('player', spr_player_02, width / 2, 75, 80, 75, 7, 0.875, 15);
		// Assign player entity to global varible for ease of use
		player = entityManager.getEntityById('player');
		// Set player health bar colour
		player.healthBar.cColor = '#ce9069';
		player.healthBar.hColor = '#51bf59';
		// Add weapons to inventory (id, gun sprite, bullet sprite, parent, width, height, amount, speed, dither, damage, hit sound, hit particle, eqipped)
		player.inventory.contents.push(new Gun('staff00', spr_staff_blue, p_blue, player, player.width, player.height, 16, 16, 1, 20, 1, 2, mp3_hitmarker, p_red_small, true));

		player.inventory.contents.push(new Gun('staff01', spr_staff_orange, p_orange, player, player.width, player.height, 24, 24, 1, 10, 2, 2.5, mp3_hitmarker, p_red_small, false));

		player.inventory.contents.push(new Gun('staff03', spr_staff_red, spr_bomb, player, player.width, player.height, 64, 64, 1, 10, 2, 50, mp3_hitmarker, p_red_small, false));
		player.inventory.contents[2].explosive = true;
		player.inventory.contents[2].firerate = 0.1;

		player.inventory.contents.push(new Gun('bow01', spr_bow_01, p_dagger_01, player, player.width, player.height, 75, 24, 1, 25, 0, 5, mp3_hitmarker, p_red_small, false));
		// Player starting velocity
		player.vel.x =  0;
		player.vel.y = 25;
		// Set stage score
		this.score = score;

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

		this.enemySpawnerTop.run();
		this.enemySpawnerLeft.run();
		this.enemySpawnerRight.run();

		if ( this.enemySpawnerTop.spawnTime   > 10 ) this.enemySpawnerTop.spawnTime   -= 0.01;
		if ( this.enemySpawnerLeft.spawnTime  > 10 ) this.enemySpawnerLeft.spawnTime  -= 0.01;
		if ( this.enemySpawnerRight.spawnTime > 10 ) this.enemySpawnerRight.spawnTime -= 0.01;

		easystar.calculate();

	}
	this.display = function() {

		// Game.c.fillStyle = 'black';
		// Game.c.fillRect(0, 0, width, height);

		Game.c.save();

		Game.c.scale(g_scale, g_scale);

		Game.c.translate(random(-g_shake, g_shake), random(-g_shake, g_shake));

		backgroundManager.run();

		entityManager.run();

		if (g_particles_enabled) particleSystem.run();

		// Draw HUD
		Game.c.font = '100px m3x6';
		Game.c.fillStyle = '#ff0000';
		Game.c.fillText('fps: ' + Math.floor(fps), 10, 50);
		Game.c.fillStyle = 'white';
		Game.c.fillText('enemies: ' + entityManager.enemies.length, 10, 100);
		Game.c.fillStyle = '#ffff00';
		Game.c.fillText('score: ' + this.score, 10, 150);

		if (!g_paused) {
			Game.c.save();

			Game.c.translate(canvas.mouseX, canvas.mouseY);
			Game.c.drawImage(cur_pixel, -40 / 2, -40 / 2, 40, 40);

			Game.c.restore();
		}

		Game.c.restore();

	}

	this.onPause  = function() {}
	this.onResume = function() {}

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

		Mousetrap.bind( controls.inv1,  () => { player.inventory.slotActive = 0; }, 'keydown' );
		Mousetrap.bind( controls.inv2,  () => { player.inventory.slotActive = 1; }, 'keydown' );
		Mousetrap.bind( controls.inv3,  () => { player.inventory.slotActive = 2; }, 'keydown' );
		Mousetrap.bind( controls.inv4,  () => { player.inventory.slotActive = 3; }, 'keydown' );
		Mousetrap.bind( controls.inv5,  () => { player.inventory.slotActive = 4; }, 'keydown' );

		// Spawn bot
		Mousetrap.bind('i', () => {
			entityManager.spawnTurret(
				'player_turret' + entityManager.turrets.length,
				spr_player_01,
				entityManager.enemies,
				player.pos.x - player.width/2,
				player.pos.y - player.width/2,
				80, 75,
				25, 25,
				0.75,
				false
			);
		}, 'keydown');

		// Background script(s)
		Mousetrap.bind('y', () => {
			let _this = this;
			backgroundManager.selectBackgroundScreen('bg_level_02_trippy', function() {
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
						backgroundManager.selectBackgroundScreen('bg_level_02');
						g_shake = 0;
						vid_tunnel.pause();
					}
				}, 6000);
			});
		}, 'keydown');
	}
}
