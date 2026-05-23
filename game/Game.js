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

// Global settings and runtime values shared by the whole game
const settings = {
	// Display
	responsive        : true,	// Show extra world on wider or taller windows instead of letterboxing
	maximized		  : false,
	scale             : 1,		// Canvas pixels per game pixel, set by Game.resize()
	particlesEnabled  : true,
	shadowsEnabled    : true,
	shadowDistance    : 3,
	// World
	speed             : 1,		// Time scale, 1 is normal speed and lower is slow motion
	gravity           : 0,
	tileSize          : 64,
	shake             : 0,		// Screen shake amount
	paused            : false,
	pathfindingEnabled: true,
	powerupDropRate   : 5,		// Percent chance an enemy drops a powerup
	// Input
	gamepadConnected  : false,
	lastInput         : 'computer',	// 'computer' or 'controller'
	// Temporary: record the largest size each sprite is drawn at, see spriteSizeReport() in LoadAssets.js
	logSpriteSizes    : true
};

// Smallest area of the world that is always visible, scaled to fit the window
const baseWidth  = 1280;
const baseHeight = 720;
// Current world size in game pixels, set by Game.resize()
let width  = baseWidth;
let height = baseHeight;

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

// Release all held inputs so nothing carries over between states
function resetInput() {
	upPressed    = false;
	downPressed  = false;
	leftPressed  = false;
	rightPressed = false;
	spacePressed = false;
	mouseDown    = false;
}

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

	// Keys bound for the whole session, stored as (key, fn, event)
	this.globalBindings = [];
	// Keys bound by the current state, stored as (key, event)
	this.stateBindings  = [];

	this.getCurrentState = function() {
		return this.stateStack.stateList.top();
	}
	this.setState = function(state) {
		this.exitState();
		this.stateStack.pop();
		this.stateStack.push(state);
	}
	this.restartState = function() {
		this.exitState();
		this.getCurrentState().onEnter();
	}
	this.exitState = function() {
		// Level specific cleanup
		this.getCurrentState().onExit();
		// Cancel pending timers so they can't fire into the next state
		timerManager.clearTimers();
		// Unbind state keys and restore global ones
		this.unbindStateKeys();
		resetInput();
		// Leave the pause menu if exiting while paused
		settings.paused = false;
		this.hidePauseMenu();
		this.resetFilters();
		// Stop all audio
		if (audioLoaded) {
			audio.Group.stop();
			music.Group.stop();
		}
		// Reset global effects
		settings.shake = 0;
		settings.speed = 1;
		inputTime = 0;
	}
	// Bind a key for the whole session (dev keys)
	this.bindGlobal = function(key, fn, event) {
		Mousetrap.bind(key, fn, event);
		this.globalBindings.push(key, fn, event);
	}
	// Bind a key until the current state exits
	this.bind = function(key, fn, event) {
		Mousetrap.bind(key, fn, event);
		this.stateBindings.push(key, event);
	}
	this.unbindStateKeys = function() {
		for (let i = 0; i < this.stateBindings.length; i += 2) {
			Mousetrap.unbind(this.stateBindings[i], this.stateBindings[i + 1]);
		}
		this.stateBindings.length = 0;
		// Restore any global keys a state overrode
		for (let i = 0; i < this.globalBindings.length; i += 3) {
			Mousetrap.bind(this.globalBindings[i], this.globalBindings[i + 1], this.globalBindings[i + 2]);
		}
	}
	this.update = function() {
		this.stateStack.update();
	}
	this.display = function() {
		this.stateStack.display();
	}
	this.run = function() {
		requestAnimationFrame(this.run.bind(this));
		// Prevent speed going below 0
		if (settings.speed < 0) settings.speed = 0;
		// Apply deadzones to gamepad to stop drifting
		if (settings.gamepadConnected) {
			let gp = navigator.getGamepads()[0];

			leftJoystick.x = applyDeadzone(gp.axes[0], leftDeadzone);
			leftJoystick.y = applyDeadzone(gp.axes[1], leftDeadzone);

			rightJoystick.x = applyDeadzone(gp.axes[2], rightDeadzone);
			rightJoystick.y = applyDeadzone(gp.axes[3], rightDeadzone);
		}

		// Handle pause menu inputs
		settings.paused ? this.stateStack.pause() : this.stateStack.resume();

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
			if (!settings.paused && !this.getCurrentState().loading) {
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
		settings.paused = !settings.paused;
		if (settings.paused) {
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
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	}
	this.setupCanvas = function(wrapper) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'canvas';
        this.canvas.mouse = new Vector();
        this.c = this.canvas.getContext('2d');

        document.getElementById('canvas-div').appendChild(this.canvas);
        this.resize();
	}
	this.resize = function() {
		// Space left for the game below the title bar
		let div = document.getElementById('canvas-div');
		let cssWidth  = div.clientWidth;
		let cssHeight = div.clientHeight;
		// Scale so the base area always fits inside the window
		let scale = Math.min(cssWidth / baseWidth, cssHeight / baseHeight);
		if (settings.responsive) {
			// Grow the world on the axis with spare room so nothing stretches
			width  = cssWidth  / scale;
			height = cssHeight / scale;
		} else {
			// Keep the base area and letterbox the rest
			width  = baseWidth;
			height = baseHeight;
			cssWidth  = baseWidth  * scale;
			cssHeight = baseHeight * scale;
		}
		this.width  = width;
		this.height = height;
		// Size the canvas in CSS pixels and back it with device pixels for sharp rendering
		this.canvas.style.width  = cssWidth  + 'px';
		this.canvas.style.height = cssHeight + 'px';
		this.canvas.width  = Math.round(cssWidth  * window.devicePixelRatio);
		this.canvas.height = Math.round(cssHeight * window.devicePixelRatio);
		settings.scale = this.canvas.width / width;
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

	Pace.on('hide', async function(e) {
		// Report asset globals taken over by later scripts
		checkAssetGlobals();
		// Shrink oversized sprites before any level uses them
		await prescaleSprites();

		loading = false;

		Game.init();
		Game.run();

		Game.canvas.addEventListener('mousedown', function(e) {
			mouseDown = true;
			settings.lastInput = 'computer';
		});

		Game.canvas.addEventListener('mouseup', function(e) {
			mouseDown = false;
			settings.lastInput = 'computer';
		});

		Game.canvas.addEventListener('mousemove', function(evt) {
			// Convert from window pixels to game pixels
			let rect = this.getBoundingClientRect();
			this.mouse.x = (evt.clientX - rect.left) / rect.width  * width;
			this.mouse.y = (evt.clientY - rect.top)  / rect.height * height;

			settings.lastInput = 'computer';
		}, true);

		window.addEventListener('resize', function() {
			Game.resize();
		});
	});
};

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		settings.paused = false;
		Game.pauseGame();
	} else {
		// Do something...
	}
}, false);

document.addEventListener('keypress', (e) => {
	settings.lastInput = 'computer';
	inputTime = 0;
});

// Main window controls
document.getElementById('title-bar-minimize').onclick = function() {
	remote.ipcRenderer.send('minimize');
};
document.getElementById('title-bar-maximize').onclick = function() {
	if (!settings.maximized) {
		remote.ipcRenderer.send('maximize');
	} else {
		remote.ipcRenderer.send('unmaximize');
	}
};
document.getElementById('title-bar-close').onclick = function() {
	window.close();
};
remote.ipcRenderer.on('maximized', function(event, maximized) {
        settings.maximized = maximized;
});
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