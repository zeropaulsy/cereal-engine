var DeathScreen01 = function() {
	this.name = 'DeathScreen01';

	this.camera;

	this.onEnter = function() {
		// Set mouse cursor
		Game.canvas.style.cursor = 'auto';
		body.style.backgroundImage = '';
		// Create Camera and position
		this.camera = new Camera(Game.c);
		this.camera.moveTo(Game.canvas.width / 2, Game.canvas.height / 2);
		this.camera.zoomTo(Game.canvas.width);
		// Play deathscreen music
		music.mp3_sad_violin.play();
		// Bind keys to restart game
		Mousetrap.bind('esc', function() { Game.setState(new SnoopSlayer()) }, 'keydown');
		Mousetrap.bind( 'r',  function() { Game.setState(new SnoopSlayer()) }, 'keydown');
		// Apply canvas filters
		timerManager.addTimer(function() {
			root.style.setProperty('--grayscale', 1.00);
			root.style.setProperty('--contrast' , 1.15);
		}, 300);
	}
	this.onExit = function() {
		// Clear the canvas
		Game.clearCanvas(Game.c);	
		lastScreen = null;
		this.camera = null;
		// Stop all audio
		audio.Group.stop();
		music.Group.stop();
		// Unbind controls
		Mousetrap.unbind('esc', 'keydown');
		Mousetrap.unbind( 'r',  'keydown');
		// Reset filters applied to the canvas
		Game.resetFilters();
	}

	this.onPause  = function() {}
	this.onResume = function() {}

	this.update = function() {

	}
	this.display = function() {
		this.camera.begin();

		Game.c.save();

		Game.c.scale(g_scale, g_scale);

		Game.c.drawImage(lastScreen, 0, 0, width, height);

		// Darken image
		Game.c.fillStyle = 'rgba(0, 0, 0, 0.5)';
		Game.c.fillRect(0, 0, width, height);
		// Shadow
		Game.c.fillStyle = '#000';
		Game.c.font = '32pt Comic Sans MS';
	    Game.c.textAlign = "center";
	    Game.c.fillText("u rekt " + score + " scrubs", width / 2 + 2, height / 2 - 28);
	    Game.c.fillText("1 skrub rekt u", width / 2 + 2, height / 2 + 18);
	    Game.c.font = '14pt Comic Sans MS';
	    Game.c.fillText("Press r to restart", width / 2 + 2, height / 2 + 45);
	    // Text
	    Game.c.fillStyle = '#fff';
	    Game.c.font = '32pt Comic Sans MS';
	    Game.c.textAlign = "center";
	    Game.c.fillText("u rekt " + score + " scrubs", width / 2, height / 2 - 30);
	    Game.c.fillText("1 skrub rekt u", width / 2, height / 2 + 16);
	    Game.c.font = '14pt Comic Sans MS';
	    Game.c.fillText("Press r to restart", width / 2, height / 2 + 43);

		Game.c.restore();

		this.camera.end();
	}
}