// Level Class : Level(name), extends State
//
// Base class for playable levels. It owns the engine wiring every level needs
// (camera, managers, audio, shake, spawners, death, draw order, pause and
// default controls), so a level only overrides the hooks it needs:
//
//   setup()            spawn the player, backgrounds, spawners. Runs at the end of onEnter
//   tick()             level specific update, runs every unpaused frame
//   drawWorld()        extra drawing in world space, after entities and particles
//   drawHud()          drawing in screen space, on top of everything
//   cleanup()          free anything setup() created that isn't a manager or global
//   dropPowerup(enemy) called by Enemy on death (settings.powerupDropRate)
//   dashEvent()        called when the player dashes
//
// Options a level can set in its constructor after super():
//   background, cursor, hideCursor, maxEntities, maxParticles, maxBackgrounds,
//   spawnRamp, minSpawnTime, deathScreen
//
// Game.exitState() resets timers, keybinds (bind with Game.bind), input, pause,
// CSS filters, audio, settings.shake and settings.speed when the level is left.
class Level extends State {
	constructor(name) {
		super(name);
		this.loading = true;
		this.score = 0;
		this.camera = null;
		this.spawners = [];
		this.dampenShake = true;
		// Image used as the html body background behind the canvas
		this.background = null;
		// Cursor image drawn at the mouse position, hides the system cursor
		this.cursor = cur_pixel;
		this.hideCursor = true;
		// Manager limits
		this.maxEntities = 5000;
		this.maxParticles = 1000;
		this.maxBackgrounds = 10;
		// Spawn time removed from each spawner every frame, down to minSpawnTime
		this.spawnRamp = 0;
		this.minSpawnTime = 10;
		// State class to switch to when the player dies, given this level's class to restart into.
		// Defaults to Game.deathScreen from game/config.js
		this.deathScreen = Game.deathScreen;
		// Reused by edgePoint() so spawning doesn't allocate
		this.spawnPoint = new Vector();
	}

	// Hooks for levels to override
	setup() {}
	tick() {}
	drawWorld() {}
	drawHud() {}
	cleanup() {}
	dropPowerup(enemy) {}
	dashEvent() {}

	onEnter() {
		this.loading = true;
		// Set html body background
		body.style.backgroundImage = this.background ? 'url(' + this.background.src + ')' : '';
		Game.canvas.style.cursor = this.hideCursor ? 'none' : 'auto';
		// Set mouse position
		Game.canvas.mouse.x = width;
		Game.canvas.mouse.y = height / 2;
		// Set global variables
		settings.tileSize = 64;
		settings.pathfindingEnabled = false;
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
		// Define managers
		backgroundManager = new BackgroundManager(this.maxBackgrounds, 0);
		entityManager = new EntityManager(this.maxEntities);
		particleSystem = new ParticleSystem(this.maxParticles);
		// Reset level state
		this.score = 0;
		this.spawners.length = 0;
		this.dampenShake = true;

		this.bindControls();
		// Level specific setup
		this.setup();

		this.checkSetup();

		console.log(this.name + ' entered.');

		this.loading = false;
	}
	// Timers, keybinds, input, filters, audio and settings are reset by Game.exitState()
	onExit() {
		// Level specific cleanup
		this.cleanup();
		// Destroy camera and spawners
		this.camera = null;
		this.spawners.length = 0;
		// Reset managers
		backgroundManager = null;
		entityManager = null;
		particleSystem = null;
		// Reset player
		player = null;
		// Add level score to global score
		score = this.score;

		console.log(this.name + ' left.');
	}
	onDeath() {
		lastScreen = canvasDataToImage(Game.canvas);

		if (this.deathScreen) {
			Game.setState(new this.deathScreen(this.constructor));
		} else {
			Game.restartState();
		}
	}
	onPause() {
		Game.showPauseMenu();
	}
	onResume() {
		Game.hidePauseMenu();
		if (this.hideCursor) Game.canvas.style.cursor = 'none';
	}

	update() {
		// Screen shake
		if (settings.shake !== 0 && !settings.paused) {
			this.camera.moveTo(
				(Game.canvas.width  / 2) + random(-settings.shake, settings.shake),
				(Game.canvas.height / 2) + random(-settings.shake, settings.shake)
			);
		} else {
			this.camera.moveTo(
				(Game.canvas.width  / 2),
				(Game.canvas.height / 2)
			);
		}
		this.camera.zoomTo(Game.canvas.width - (settings.shake * 3));
		// Run spawners and ramp up difficulty
		for (let i = 0; i < this.spawners.length; i++) {
			let spawner = this.spawners[i];
			spawner.run();
			if (spawner.spawnTime > this.minSpawnTime) spawner.spawnTime -= this.spawnRamp;
		}

		inputTime++;
		// Level specific update
		this.tick();
		// tick() may have left the level
		if (Game.getCurrentState() !== this) return;

		if (player && player.health <= 1) {
			this.onDeath();
			return;
		}
		// Dampen and clamp screen shake
		if (settings.shake > 0 && this.dampenShake) settings.shake -= 0.5;
		if (settings.shake < 0) settings.shake = 0;
	}
	display() {
		// World space, moved by the camera
		this.camera.begin();
		Game.c.save();

		Game.c.scale(settings.scale, settings.scale);

		if (!settings.paused) {

			// Backgrounds are optional
			if (backgroundManager.screens.length > 0) backgroundManager.run();
			entityManager.run();
			if (settings.particlesEnabled) particleSystem.run();

			this.drawWorld();
			// Draw cursor
			if (this.cursor) {
				Game.c.drawImage(this.cursor, Game.canvas.mouse.x - 20, Game.canvas.mouse.y - 20, 40, 40);
			}
		}

		Game.c.restore();
		this.camera.end();

		// Screen space, on top of the game
		Game.c.save();

		Game.c.scale(settings.scale, settings.scale);

		this.drawHud();

		Game.c.restore();
	}

	bindControls() {
		// Movement
		Game.bind( controls.up,    () => { upPressed    = true;  }, 'keydown' );
		Game.bind( controls.up,    () => { upPressed    = false; }, 'keyup'   );

		Game.bind( controls.left,  () => { leftPressed  = true;  }, 'keydown' );
		Game.bind( controls.left,  () => { leftPressed  = false; }, 'keyup'   );

		Game.bind( controls.down,  () => { downPressed  = true;  }, 'keydown' );
		Game.bind( controls.down,  () => { downPressed  = false; }, 'keyup'   );

		Game.bind( controls.right, () => { rightPressed = true;  }, 'keydown' );
		Game.bind( controls.right, () => { rightPressed = false; }, 'keyup'   );
		// Dash
		Game.bind( controls.space, () => { spacePressed = true; this.playerDashEvent(); }, 'keydown' );
		Game.bind( controls.space, () => { spacePressed = false; }, 'keyup' );
		// Inventory slots, ignored if the slot is empty
		Game.bind( controls.inv1,  () => { this.selectSlot(0); }, 'keydown' );
		Game.bind( controls.inv2,  () => { this.selectSlot(1); }, 'keydown' );
		Game.bind( controls.inv3,  () => { this.selectSlot(2); }, 'keydown' );
		Game.bind( controls.inv4,  () => { this.selectSlot(3); }, 'keydown' );
		Game.bind( controls.inv5,  () => { this.selectSlot(4); }, 'keydown' );
		// Pause
		Game.bind('esc', () => { Game.pauseGame() }, 'keydown');
	}
	// Warn about setup() mistakes the engine would otherwise crash on later
	checkSetup() {
		if (!player) {
			console.error(this.name + ': setup() did not spawn a player, use this.spawnPlayer().');
		} else if (player.inventory.contents.length === 0) {
			console.error(this.name + ': the player has no weapons, pass makeWeapons to this.spawnPlayer().');
		}
	}

	// Helpers for setup()

	// Spawn the player and assign it to the global player
	// spawnPlayer(sprite, x, y, width, height, health, speed, makeWeapons)
	// makeWeapons(parent) returns the player's guns, since a Gun needs its parent when created
	spawnPlayer(sprite, x, y, width, height, health, speed, makeWeapons) {
		player = new Player('player', sprite, x, y, width, height, health, speed);
		entityManager.spawnEntity(player);
		let weapons = makeWeapons ? makeWeapons(player) : [];
		player.inventory = new Inventory(10, weapons);
		// Equip the first weapon if none are equipped
		if (weapons.length > 0 && !player.inventory.getEquippedItem()) weapons[0].equipped = true;
		return player;
	}
	// Add a background screen : addBackground(id, images, alpha, gifs). The first one added is shown
	addBackground(id, images, alpha, gifs) {
		let screen = new BackgroundScreen(id, images, alpha === undefined ? 1 : alpha, gifs);
		backgroundManager.screens.push(screen);
		return screen;
	}
	// Add an enemy spawner run every frame : addSpawner(spawnTime, callback)
	addSpawner(spawnTime, callback) {
		// EnemySpawner(max, spawnTime, spawnTimer, active, amount, callback)
		let spawner = new EnemySpawner(250, spawnTime, 25, true, 1, callback);
		this.spawners.push(spawner);
		return spawner;
	}
	// Random point just off a screen edge ('top', 'bottom', 'left' or 'right'). The returned Vector is reused
	edgePoint(edge, margin) {
		margin = margin || 80;
		let p = this.spawnPoint;
		if (edge == 'top' || edge == 'bottom') {
			p.x = randomInt(150, width - 150);
			p.y = edge == 'top' ? -margin : height + margin;
		} else {
			p.x = edge == 'left' ? -margin : width + margin;
			p.y = randomInt(150, height - 150);
		}
		return p;
	}

	// Called by engine classes and default controls
	playerDashEvent() {
		if (!player) return;
		player.dash(player.dashVel, () => { this.dashEvent(); });
	}
	selectSlot(slot) {
		if (player && player.inventory && slot < player.inventory.contents.length) {
			player.inventory.selectSlot(slot);
		}
	}
}
