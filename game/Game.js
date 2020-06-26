let loading = true;

let backgroundAlpha = 1;
let maxFps = 60;
let lastCalledTime;
let fps;
let delta;

let g_gravity = 0;
let g_tileSize = 64;
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

let controls = {
	// Movement
	up: 'w',
	left: 'a',
	down: 's',
	right: 'd',
	space: 'space',
	// Inventory
	inv1: '1',
	inv2: '2',
	inv3: '3',
	inv4: '4',
	inv5: '5',
}

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

let leftJoystick  = {x: 0, y: 0};
let rightJoystick = {x: 0, y: 0};
let leftDeadzone  = 0.25;
let rightDeadzone = 0.25;

let backgroundManager;
let entityManager;
let particleSystem;
let player;

let score = Number();

var Game = {
	width: 1280,
	height: 720,
	canvas: null,
	c: null,

	stateStack: new StateStack(),

	getCurrentState: function() {
		return this.stateStack.stateList.top();
	},
	setState: function(state) {
		Game.stateStack.pop();
		Game.stateStack.push(state);
	},

	update: function() {
		this.stateStack.update();
	},
	display: function() {
		this.stateStack.display();
	},
	run: function() {
		requestAnimationFrame(Game.run);
		// Set image rendering to nearest neighbour
		Game.c.imageSmoothingEnabled = false;
		// Set loading to false once pace completes asset preload
		if (Pace.bar.progress == 100) loading = false;
		// Set scale based on window size
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
		// Update and render current state
		if (!loading) {
			if (!g_paused) {
				Game.stateStack.update();
			}
			Game.stateStack.display();
		}
	},

	startGame: function() {
		this.stateStack.push(new Level01());
	},
	pauseGame: function() {
		g_paused = !g_paused;
	},

	setupCanvas: function(wrapper) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'canvas';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.c = this.canvas.getContext('2d');

        wrapper.appendChild(this.canvas);
	},
	init: function() {
		this.setupCanvas(document.getElementById('body'));
		this.startGame();
	}
}

window.onload = function () {
    window.getGameDimensions = function() {
        return {
            width: Game.width,
            height: Game.height
        };
    };

	window.getMousePos = function(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

    Game.init();
	Game.run();

	Game.canvas.addEventListener('mousedown', function(e) {
		mouseDown = true;
		g_lastInput = 'computer';
	});

	Game.canvas.addEventListener('mouseup', function(e) {
		mouseDown = false;
		g_lastInput = 'computer';
	});

	Game.canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(canvas, evt);
		this.mouseX = mousePos.x / g_scale;
		this.mouseY = mousePos.y / g_scale;
		g_lastInput = 'computer';
	}, true);
};

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

function averageNums(a, b, f) {
	var avg = (Math.atan2(Math.sin(a) * (f) + Math.sin(b) * (1 - f), Math.cos(a) * (f) + Math.cos(b) * (1 - f)));
	return avg;
}

function applyDeadzone(number, threshold) {
	percentage = (Math.abs(number) - threshold) / (1 - threshold);

	if (percentage < 0)
		percentage = 0;

	return percentage * (number > 0 ? 1 : -1);
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

window.addEventListener('resize', function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	width = Game.canvas.width / g_scale;
	height = Game.canvas.height / g_scale;
});
