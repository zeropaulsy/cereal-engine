// Dev
Mousetrap.bind('esc', () => { Game.pauseGame(); }, 'keydown');

Mousetrap.bind('r', () => { location.reload(); }, 'keydown' );

Mousetrap.bind('q', () => { Game.getCurrentState().onEnter(); }, 'keydown' );

// Player Movement
/*
Mousetrap.bind('w', () => { upPressed    = true;  },'keydown');
Mousetrap.bind('w', () => { upPressed    = false; }, 'keyup' );

Mousetrap.bind('a', () => { leftPressed  = true;  },'keydown');
Mousetrap.bind('a', () => { leftPressed  = false; }, 'keyup' );

Mousetrap.bind('s', () => { downPressed  = true;  },'keydown');
Mousetrap.bind('s', () => { downPressed  = false; }, 'keyup' );

Mousetrap.bind('d', () => { rightPressed = true; }, 'keydown');
Mousetrap.bind('d', () => { rightPressed = false; }, 'keyup' );

Mousetrap.bind('1', () => { player.inventory.slotActive = 0; }, 'keydown');
Mousetrap.bind('2', () => { player.inventory.slotActive = 1; }, 'keydown');
Mousetrap.bind('3', () => { player.inventory.slotActive = 2; }, 'keydown');
Mousetrap.bind('4', () => { player.inventory.slotActive = 3; }, 'keydown');
Mousetrap.bind('5', () => { player.inventory.slotActive = 4; }, 'keydown');
*/

// Scripted Events
/*
Mousetrap.bind('i', () => {
	entityManager.spawnTurret(
		'player_turret' + entityManager.turrets.length,
		spr_player_02,
		entityManager.enemies,
		player.pos.x - player.width/2,
		player.pos.y - player.width/2,
		80, 75,
		25, 25,
		0.9,
		false
	);
}, 'keydown');

// Player dash script
Mousetrap.bind('space', () => {
	player.dash(5, function() {
		document.getElementById('body').style.filter = 'saturate(1.5)';
		let currentBackground = backgroundManager.screens[backgroundManager.screenSelected];
		g_shake += 5;
		setTimeout(function() {
			document.getElementById('body').style.filter = ''
			g_shake -= 5;
		}, 100);
		setTimeout(function() {
			player.dashing = false;
		}, 300)
	});
}, 'keyup' );
*/

// Scripted background events
/*
Mousetrap.bind('y', () => {
	backgroundManager.selectBackgroundScreen('trippy', (function() {
		document.getElementById('body').style.filter = 'saturate(1.5)';
		g_shake = 5;
		vid_tunnel.play();
		backgroundManager.getBackgroundById('trippy').timer = new Timer(function() {
			document.getElementById('body').style.filter = '';
			backgroundManager.selectBackgroundScreen('windowsXP');
			g_shake = 0;
		}, 6000);
	})());
}, 'keydown');

Mousetrap.bind('t', () => {
	backgroundManager.selectBackgroundScreen('spooky', (function() {
		// Set a greyscale filter on the html body
		document.getElementById('body').style.filter = 'grayscale(0.5)';
		//entityManager.spawnEnemy('spooky_enemy' + entityManager.enemies.length, spr_shrek, player, width + 200, random(0, height/2*g_scale), 65*3, 65*3, true, 5, 500, mp3_hitmarker, 42069);
		entityManager.spawnEnemy('spooky_enemy' + entityManager.enemies.length, spr_spooky_enemy, player, width + 200, random(0, height/2*g_scale), 53*3, 65*3, true, 5, 500, mp3_hitmarker, 42069);
		// Disable main enemy spawner and spawn skeletons
		g_shake = 5;
		//enemySpawner.active = false;
		spookySpawner.active = true;
		// Play spooky song
		mp3_spooky_song.currentTime = 30.25;
		mp3_spooky_song.play();
		// Start a timer and undo changes when it runs out
		backgroundManager.getBackgroundById('spooky').timer = new Timer(function() {
			// Remove filter from html body
			document.getElementById('body').style.filter = '';
			//spookySpawner.active = false;
			//enemySpawner.active = true;
			g_shake = 0;
			// Stop and reset song
			mp3_spooky_song.pause();
			mp3_spooky_song.currentTime = 0;
			// Set background to default
			backgroundManager.selectBackgroundScreen('windowsXP');
		}, 6900);
	})());
}, 'keydown');
*/
