Gamepad.on('connect', e => {
    console.log(`controller ${e.index} connected!`);
	initializeGamepadControls();
    g_lastInput = 'controller';
    g_gamepadConnected = true;
});

Gamepad.on('press', 'vendor', e => {
    g_lastInput = 'controller';
    g_gamepadConnected = true;
});

function initializeGamepadControls() {
	Gamepad.on('hold', 'd_pad_up', () => {
	    player.moveUp();
	});

	Gamepad.on('hold', 'd_pad_down', () => {
	    player.moveDown();
	});

	Gamepad.on('hold', 'd_pad_left', () => {
	    player.moveLeft();
	});

	Gamepad.on('hold', 'd_pad_right', () => {
	    player.moveRight();
	});

	Gamepad.on('press', 'shoulder_top_left', () => {
		player.inventory.slotActive--;
	});

	Gamepad.on('press', 'shoulder_top_right', () => {
		player.inventory.slotActive++;
	});

	Gamepad.on('press', 'start', () => {
	    if (g_gamepadConnected) Game.pauseGame();
	});

	Gamepad.on('press', 'shoulder_bottom_left', e => {
		Game.getCurrentState().playerDashEvent();
	});
}
