let loading = true;
let tick = 0;

let backgroundAlpha = 1;
let maxFps = 60;
let lastCalledTime;
let fps;
let targetDelta = 1000/maxFps;
let delta;
let inputTime = 0;
let lastScreen;
let root = document.querySelector(':root');

let g_responsive = true;
let g_speed = 1;
let g_gravity = 0;
let g_tileSize = 64;
let g_particles_enabled = true;
let g_paused = false;
let g_shake = 0;
let g_gamepadConnected = false;
let g_lastInput = 'computer';
let g_scale = 1;
let g_powerup_drop_rate = 5;
let g_shadow_distance = 3;
let g_shadows_enabled = true;
let g_pathfinding_enabled = true;

let width = 1280;
let height = 720;

let mouseDown = false;
let mouseUp = false;
let mouseMoving = false;

let controls = {
	// Movement
	up:   'w',
	left: 'a',
	down: 's',
	right:'d',
	space:'space',
	// Inventory
	inv1: '1',
	inv2: '2',
	inv3: '3',
	inv4: '4',
	inv5: '5',
}

let upPressed    = false;
let downPressed  = false;
let leftPressed  = false;
let rightPressed = false;
let spacePressed = false;

let leftJoystick  = new Vector();
let rightJoystick = new Vector();
let leftDeadzone  = 0.25;
let rightDeadzone = 0.25;

let timerManager = new TimerManager();
let backgroundManager;
let entityManager;
let particleSystem;
let player;

let score = 0;

let Game = new GameObject();

function GameObject() {
	this.width  = width;
	this.height = height;
	this.canvas = null;
	this.c      = null;

	this.stateStack = new StateStack();

	this.getCurrentState = function() {
		return this.stateStack.stateList.top();
	}
	this.setState = function(state) {
		this.stateStack.pop();
		this.stateStack.push(state);
	}
	this.update = function() {
		this.stateStack.update();
	}
	this.display = function() {
		this.stateStack.display();
	}
	this.run = function() {
		requestAnimationFrame(this.run.bind(this));
		// Set scale based on window size
		g_scale = this.canvas.width / width;
		if (g_responsive) {
			width = window.innerWidth;
			height = window.innerHeight - 28;
		}
		// Prevent speed going below 0
		if (g_speed < 0) g_speed = 0;
		// Apply deadzones to gamepad to stop drifting
		if (g_gamepadConnected) {
			let gp = navigator.getGamepads()[0];

			leftJoystick.x = applyDeadzone(gp.axes[0], leftDeadzone);
			leftJoystick.y = applyDeadzone(gp.axes[1], leftDeadzone);

			rightJoystick.x = applyDeadzone(gp.axes[2], rightDeadzone);
			rightJoystick.y = applyDeadzone(gp.axes[3], rightDeadzone);
		}

		// Handle pause menu inputs
		g_paused ? this.stateStack.pause() : this.stateStack.resume();

		// Calculate current framerate
		if (!lastCalledTime) {
			lastCalledTime = performance.now();
			fps = 0;
			return;
		}
		delta = (performance.now() - lastCalledTime);
		deltaTime = delta / targetDelta;
		lastCalledTime = performance.now();
		fps = 1000 / delta;
		// Update and render current state
		if (!loading) {
			if (!g_paused && !this.getCurrentState().loading) {
				this.stateStack.update();
			}
			this.stateStack.display();
		}
		tick++;
	}
	this.startGame = function() {
		this.setState(new WindowsDefender());
	}
	this.pauseGame = function() {
		g_paused = !g_paused;
		if (g_paused) {
			pauseActiveSounds();
			timerManager.pauseTimers();
		} else {
			resumeActiveSounds();
			timerManager.resumeTimers();
		}
	}
	this.showPauseMenu = function() {
		if (document.getElementById('pause-window').style.display !== 'block') {
			// Set html body background as canvas data
			// body.style.backgroundImage = 'url(' + Game.canvas.toDataURL() + ')';
			// Show pause menu if hidden
			document.getElementById('pause-window').style.display = 'block';
			// Set game cursor style
			canvas.style.cursor = 'auto';
			// Apply canvas filter
			root.style.setProperty('--brightness', 0.5);
		}
	}
	this.hidePauseMenu = function() {
		if (document.getElementById('pause-window').style.display !== 'none') {
			// Hide pause menu if visible
			document.getElementById('pause-window').style.display = 'none';
			// Set game cursor style
			canvas.style.cursor = 'auto';
			// Remove canvas filter
			root.style.setProperty('--brightness', 1);
		}
	}
	this.setFilter = function(filter, value) {
		// Apply canvas filter
		root.style.setProperty(filter, value);
	}
	this.resetFilters = function() {
		root.style.setProperty('--blur',       0);
		root.style.setProperty('--contrast',   1);
		root.style.setProperty('--brightness', 1);
		root.style.setProperty('--grayscale',  0);
		root.style.setProperty('--hue-rotate', 0);
		root.style.setProperty('--opacity',    1);
		root.style.setProperty('--saturate',   1);
		root.style.setProperty('--sepia',      0);
	}
	this.clearCanvas = function(context) {
		context.clearRect(0, 0, width, height);
	}
	this.setupCanvas = function(wrapper) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'canvas';
        this.canvas.width  = window.innerWidth  * window.devicePixelRatio;
        this.canvas.height = (window.innerHeight * window.devicePixelRatio);
        this.canvas.mouse = new Vector();
        this.c = this.canvas.getContext('2d');

        document.getElementById('canvas-div').appendChild(this.canvas);
	}
	this.getWindowSize = function() {
		return {
			width  : window.innerWidth  * window.devicePixelRatio,
			height : (window.innerHeight * window.devicePixelRatio)
		};
	}
	this.init = function() {
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
			x: (evt.clientX + Game.getCurrentState().camera.lookAt[0]) - canvas.width / 2,
			y: (evt.clientY + Game.getCurrentState().camera.lookAt[1]) - canvas.height/ 2
		};
	}

	Pace.on('hide', function(e) {
		loading = false;

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

			this.mouse.x = (mousePos.x * window.devicePixelRatio) / g_scale;
			this.mouse.y = ((mousePos.y * window.devicePixelRatio) / g_scale) - 28;

			g_lastInput = 'computer';
		}, true);

		window.addEventListener('resize', function() {
			Game.canvas.width  = window.innerWidth  * window.devicePixelRatio;
			Game.canvas.height = (window.innerHeight * window.devicePixelRatio);
		});
	});
};

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		g_paused = false;
		Game.pauseGame();
	} else {
		// Do something...
	}
}, false);

document.addEventListener('keypress', (e) => {
	g_lastInput = 'computer';
	inputTime = 0;
});

// Main window controls
document.getElementById('title-bar-minimize').onclick = function() {
	remote.ipcRenderer.send('minimize');
};
document.getElementById('title-bar-maximize').onclick = function() {
	remote.ipcRenderer.send('maximize');
};
document.getElementById('title-bar-close').onclick = function() {
	window.close();
};
// Pause window controls
document.getElementById('audio-slider').onclick = function() {
	Game.pauseGame();
};
document.getElementById('audio-slider').onclick = function() {
	if (audioLoaded) {
		audio.Group.volume = document.getElementById('audio-slider').value / 100;
	}
};
document.getElementById('music-slider').onclick = function() {
	if (audioLoaded) {
		music.Group.volume = document.getElementById('music-slider').value / 100;
	}
};
// Make the DIV element draggable:
dragElement( document.getElementById('pause-window') );

function dragElement(elmnt) {
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if ( document.getElementById(elmnt.id + '-title-bar') ) {
		// if present, the header is where you move the DIV from:
		document.getElementById(elmnt.id + '-title-bar').onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top  = (elmnt.offsetTop  - pos2) + 'px';
		elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}