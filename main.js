// Modules to control application life and create native browser window
const {app, BrowserWindow, screen} = require('electron')
const remote 			   = require('electron').remote;
const path                 = require('path')
const {ipcMain}            = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		useContentSize: true,
		width: 1280,
		height: 720 + 28,
		minWidth: 640,
		minHeight: 360,
		backgroundColor: '#000000',
		frame: false,
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			nodeIntegrationInWorker: true,
			contextIsolation: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// Snap the game area to the closest supported aspect ratio after the user resizes
	snapAspectRatio(mainWindow);
	if (process.platform !== 'darwin') mainWindow.setMenu(null);

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	// mainWindow.webContents.openDevTools();

	// Tell the renderer when the window is maximized or restored
	mainWindow.on('maximize',   () => mainWindow.webContents.send('maximized', true));
	mainWindow.on('unmaximize', () => mainWindow.webContents.send('maximized', false));
	// Send the starting state once the page can hear it
	mainWindow.webContents.on('did-finish-load', () => mainWindow.webContents.send('maximized', mainWindow.isMaximized()));

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// Aspect ratios (width / height) the game area snaps to, currently widescreen only
const aspectRatios = [16/9];
// Height of the HTML title bar above the game area, in CSS pixels
const titleBarHeight = 28;
// Wait this long after the last resize event before snapping, so dragging stays smooth
const snapDelay = 150;

function snapAspectRatio(win) {
	let lastSize = win.getContentSize();
	let snapTimer;

	win.on('resize', function() {
		clearTimeout(snapTimer);
		snapTimer = setTimeout(snap, snapDelay);
	});

	function snap() {
		if (win.isDestroyed()) return;
		let [w, h] = win.getContentSize();
		// Leave maximized and fullscreen windows alone, taskbars and docks give them uneven sizes
		if (win.isMaximized() || win.isFullScreen()) {
			lastSize = [w, h];
			return;
		}
		let gameHeight = h - titleBarHeight;
		// Find the closest ratio, compared on a log scale so wider and taller count equally
		let current = Math.log(w / gameHeight);
		let ratio = aspectRatios.reduce((best, r) =>
			Math.abs(Math.log(r) - current) < Math.abs(Math.log(best) - current) ? r : best);
		// Keep whichever side the user changed most and fit the other one to the ratio
		let keepWidth = Math.abs(w - lastSize[0]) / lastSize[0] >= Math.abs(h - lastSize[1]) / lastSize[1];
		let minH = win.getMinimumSize()[1];
		let area = screen.getDisplayMatching(win.getBounds()).workArea;
		let newW = w;
		let newH = Math.round(w / ratio) + titleBarHeight;
		// Fit the width to the height instead if the new height is too small or too tall for the screen
		if (!keepWidth || newH < minH || newH > area.height) {
			newW = Math.round(gameHeight * ratio);
			newH = h;
		}
		lastSize = [newW, newH];
		// Skip tiny corrections so the snap doesn't trigger itself again
		if (Math.abs(newW - w) > 1 || Math.abs(newH - h) > 1) win.setContentSize(newW, newH);
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
	createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	// if (process.platform !== 'darwin') app.quit();
	app.quit();
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow();
})
// Window controls
ipcMain.on('minimize', () => {
	mainWindow.minimize();
})
ipcMain.on('maximize', () => {
	mainWindow.maximize();
})
ipcMain.on('unmaximize', () => {
        mainWindow.unmaximize();
})