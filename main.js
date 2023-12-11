// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const remote = require('electron').remote;
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
		height: 720,
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

	// Set window aspect ratio
	// mainWindow.setAspectRatio(1280/720);
	if (process.platform !== 'darwin') mainWindow.setMenu(null);

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	// mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
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
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('minimize', () => {
	mainWindow.minimize();
})

ipcMain.on('maximize', () => {
	mainWindow.maximize();
})