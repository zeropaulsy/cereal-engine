const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

//canvas.width = 640, canvas.height = 360;
//canvas.style.width='100%'

const vid_tunnel = document.getElementById('vid_tunnel');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let loading = true;

let backgroundAlpha = 1;
let maxFps = 60;
let lastCalledTime;
let fps;
let delta;

let g_gravity = 0;
let g_tileSize = 8;
let g_particles_enabled = true;
let g_paused = false;
let g_shake = 0;
let g_gamepadConnected = false;
let g_lastInput = 'computer';
let g_scale = 1;

let width;
let height;

let mouseX;
let mouseY;

let mouseDown = false;
let mouseUp = false;

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;

let leftJoystick  = {x: 0,y: 0};
let rightJoystick = {x: 0,y: 0};
let leftDeadzone  = 0.25;
let rightDeadzone = 0.25;

let backgroundManager;
let entityManager;
let particleSystem;
let enemySpawnerTop;
let enemySpawnerLeft;
let enemySpawnerRight;

let player;
let score;

function setup() {
	Game.setState(new Level01);
	/*
	width = canvas.width;
	height = canvas.height;

	g_tileSize = 64;
	g_shake = 0;

	backgroundManager = new BackgroundManager(10, 0);

	backgroundManager.screens.push(new BackgroundScreen('windowsXP', [bg_level_01], 1));
	backgroundManager.screens.push(new BackgroundScreen('trippy', [vid_tunnel, bg_trip, bg_level_01], 0.1));
	backgroundManager.screens.push(new BackgroundScreen('spooky', [bg_level_01], 1));

	entityManager = new EntityManager(5000);

	for (var i = 0; i < map.tiles.length; i++) {
		for (var j = 0; j < map.tiles[i].length; j++) {
			if (map.tiles[i][j] == 1) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 16, 0, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
			if (map.tiles[i][j] == 2) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 8, 0, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
			if (map.tiles[i][j] == 3) entityManager.spawnTile('tile' + entityManager.entities.length, ts_map, 24, 0, 8, 8, (g_tileSize / 2) + (j * g_tileSize), (g_tileSize / 2) + (i * g_tileSize), g_tileSize, g_tileSize, true, 10);
		}
	}

	enemySpawnerTop = new EnemySpawner(1000, 55, 25, true, function() {
		if (Math.round(random(0, 5)) != 5) {
			entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy, player, width / 2, -25, 50, 55, false, random(1.2, 2), 10, mp3_hitmarker, 1);
		} else {
			entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy_03, player, width / 2, -25, 100, 130, true, random(6, 7), 250, mp3_hitmarker, 1);
		}
	}, 1);

	enemySpawnerLeft = new EnemySpawner(1000, 75, 25, true, function() {
		if (Math.round(random(0, 1)) == 0) {
			entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy, player, -45, 346, 50, 55, false, random(1.2, 2), 10, mp3_hitmarker, 1);
		} else {
			entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy_02, player, -45, 346, 60, 80, false, random(3, 4), 25, mp3_hitmarker, 1);
		}
	}, 1);

	enemySpawnerRight = new EnemySpawner(1000, 75, 25, true, function() {
		if (Math.round(random(0, 1)) == 0) {
			entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy, player, width + 45, 346, 50, 55, false, random(1.2, 2), 10, mp3_hitmarker, 1);
		} else {
			entityManager.spawnEnemy('enemy' + entityManager.enemies.length, spr_enemy_02, player, width + 45, 346, 60, 80, false, random(3, 4), 25, mp3_hitmarker, 1);
		}
	}, 1);

	particleSystem = new ParticleSystem(2000);

	entityManager.spawnPlayer('player', spr_player_01, width / 2, height - (75 / 2), 80, 75, 7, 0.875, 15);

	player = entityManager.getEntityById('player');

	score = 0;
	*//
}
setup();

function update() {

	enemySpawnerTop.run();

	enemySpawnerLeft.run();

	enemySpawnerRight.run();

	easystar.calculate();

}

function draw() {

	Game.c.save();

	Game.c.scale(g_scale, g_scale);

	Game.c.translate(random(-g_shake, g_shake), random(-g_shake, g_shake));

	backgroundManager.run();

	entityManager.run();

	if (g_particles_enabled) particleSystem.run();

	if (!g_paused) {
		Game.c.save();

		Game.c.translate(canvas.mouseX, canvas.mouseY);
		Game.c.drawImage(cur_rockin, -35 / 2, -35 / 2, 35, 35);

		Game.c.restore();
	}

	// Draw HUD
	Game.c.font = '100px m3x6';
	Game.c.fillStyle = '#ff0000';
	Game.c.fillText('fps: ' + Math.floor(fps), 10, 50);
	Game.c.fillStyle = 'white';
	Game.c.fillText('enemies: ' + entityManager.enemies.length, 10, 100);
	Game.c.fillStyle = '#ffff00';
	Game.c.fillText('score: ' + score, 10, 150);

	Game.c.restore();

}

function run(evt) {
	requestAnimationFrame(run);

	Game.c.imageSmoothingEnabled = false;

	if (Pace.bar.progress == 100) loading = false;

	g_scale = canvas.width / 1280;

	// Apply deadzones to gamepad to stop drifting
	if (g_gamepadConnected) {
		let gp = navigator.getGamepads()[0];

		leftJoystick.x = applyDeadzone(gp.axes[0], leftDeadzone);
		leftJoystick.y = applyDeadzone(gp.axes[1], leftDeadzone);

		rightJoystick.x = applyDeadzone(gp.axes[2], rightDeadzone);
		rightJoystick.y = applyDeadzone(gp.axes[3], rightDeadzone);
	}

	// Show / hide pause menu
	if (g_paused) {
		document.getElementById("pause_menu").style.display = 'block';
		canvas.style.cursor = 'auto';
		canvas.style.filter = 'blur(5px) brightness(0.5)';
	} else {
		document.getElementById("pause_menu").style.display = 'none';
		canvas.style.cursor = 'none';
		canvas.style.filter = 'blur(0px) brightness(1)';
	}
	if (window.fullscreen) {
		document.getElementById("toggle_fullscreen").value = "Fullscreen: ON";
	} else {
		document.getElementById("toggle_fullscreen").value = "Fullscreen: OFF";
	}

	// Calculate current framerate
	if (!lastCalledTime) {
		lastCalledTime = performance.now();
		fps = 0;
		return;
	}
	delta = (performance.now() - lastCalledTime) / 1000;
	lastCalledTime = performance.now();
	fps = 1 / delta;

	if (!loading) {
		if (!g_paused) {
			update();
		}
		draw();
	}
}
run();

// Square hitbox detection
function collisionBetween1(shapeA, shapeB) {
	// get the vectors to check against
	var vA = new Vector(shapeA.pos.x - shapeB.pos.x, shapeA.pos.y - shapeB.pos.y),
		// add the half widths and half heights of the objects
		hWidths = (shapeA.hitbox.w / 2) + (shapeB.hitbox.w / 2),
		hHeights = (shapeA.hitbox.h / 2) + (shapeB.hitbox.h / 2),
		colDir = null;

	if (Math.abs(vA.x) < hWidths && Math.abs(vA.y) < hHeights) {
		// figures out on which side we are colliding (top, bottom, left, or right)
		var vR = new Vector(hWidths - Math.abs(vA.x), hHeights - Math.abs(vA.y));

		if (vR.x >= vR.y) {
			if (vA.y > 0) {
				colDir = "t", shapeA.pos.y += vR.y, shapeA.vel.y = 0;
			} else {
				colDir = "b", shapeA.pos.y -= vR.y, shapeA.vel.y = 0;
			}
		} else {
			if (vA.x > 0) {
				colDir = "l", shapeA.pos.x += vR.x, shapeA.vel.x = 0;
			} else {
				colDir = "r", shapeA.pos.x -= vR.x, shapeA.vel.x = 0;
			}
		}
	}
	return colDir;
}

function arrayCollisionBetween1(arrayA, arrayB, callback) {
	// Check for collisions between arrayA and arrayB
	for (var i = 0; i < arrayA.length; i++) {
		var a = arrayA[i];
		// Loop through second array
		for (var j = 0; j < arrayB.length; j++) {
			var b = arrayB[j];
			if (collisionBetween1(a, b)) {
				callback(a, b);
			}
		}
	}
}

// Round hitbox detection
function collisionBetween2(shapeA, shapeB) {
	var dx = (shapeB.pos.x) - (shapeA.pos.x),
		dy = (shapeB.pos.y) - (shapeA.pos.y),
		angle = Math.atan2(dx, dy),
		collision = false;
	// Combined radius of the two shapes
	var radii = (shapeA.hitbox.w / 2) + (shapeB.hitbox.h / 2);
	// Compare distance to radii
	if ((dx * dx) + (dy * dy) < radii * radii && !g_paused) {
		// Move object to edge of shapeB
		shapeA.pos.x += Math.sin(angle) / radii;
		shapeA.pos.y += Math.cos(angle) / radii;
		// Set shapeA velocity to knock-back of shapeA
		shapeA.vel.x += Math.sin(angle) * -shapeB.knockBack;
		shapeA.vel.y += Math.cos(angle) * -shapeB.knockBack;
		// Store last collision in objects
		shapeA.lastCollision = shapeB;
		shapeB.lastCollision = shapeA;
		// Set collision to true
		collision = true;
	}
	return collision;
}

function arrayCollisionBetween2(arrayA, arrayB, callback) {
	// Check for collisions between arrayA and arrayB
	for (var i = 0; i < arrayA.length; i++) {
		var a = arrayA[i];
		// Loop through second array
		for (var j = 0; j < arrayB.length; j++) {
			var b = arrayB[j];
			if (collisionBetween2(a, b)) {
				callback(a, b);
			}
		}
	}
}

function inRangeOf(shapeA, shapeB, range) {
	var dx = (shapeB.pos.x) - (shapeA.pos.x),
		dy = (shapeB.pos.y) - (shapeA.pos.y),
		angle = Math.atan2(dx, dy);
	// Combined radius of the two shapes
	var radii = (shapeA.hitbox.w / 2) + (range);
	// Compare distance to radii
	if ((dx * dx) + (dy * dy) < radii * radii && !g_paused) {
		return true;
	} else {
		return false;
	}
}

function Timer(callback, delay) {
	var args = arguments,
		self = this,
		timer, start;

	this.paused = false;

	this.clear = function() {
		clearTimeout(timer);
	};

	this.pause = function() {
		this.paused = true;
		this.clear();
		delay -= new Date() - start;
	};

	this.resume = function() {
		this.paused = false;
		start = new Date();
		timer = setTimeout(function() {
			callback.apply(self, Array.prototype.slice.call(args, 2, args.length));
		}, delay);
	};

	this.resume();
}

function normalize(val, min, max) {
	return (val - min) / (max - min);
}

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function applyDeadzone(number, threshold) {
	percentage = (Math.abs(number) - threshold) / (1 - threshold);

	if (percentage < 0)
		percentage = 0;

	return percentage * (number > 0 ? 1 : -1);
}

function averageNums(a, b, f) {
	var avg = (Math.atan2(Math.sin(a) * (f) + Math.sin(b) * (1 - f), Math.cos(a) * (f) + Math.cos(b) * (1 - f)));
	return avg;
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		console.log('Window hidden.')
		g_paused = true;
	} else {
		// Do something...
	}
}, false);

document.getElementById('resume').addEventListener('click', (e) => {
	g_paused = false;
});

document.addEventListener('keypress', (e) => {
	g_lastInput = 'computer';
});

canvas.addEventListener('mousedown', (e) => {
	mouseDown = true;
	g_lastInput = 'computer';
});

canvas.addEventListener('mouseup', (e) => {
	mouseDown = false;
	g_lastInput = 'computer';
});

canvas.addEventListener('mousemove', function(evt) {
	var mousePos = getMousePos(canvas, evt);
	this.mouseX = mousePos.x / g_scale;
	this.mouseY = mousePos.y / g_scale;
	g_lastInput = 'computer';
}, true);

window.addEventListener('resize', function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	width = canvas.width / g_scale;
	height = canvas.height / g_scale;
});
