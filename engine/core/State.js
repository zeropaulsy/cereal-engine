// State Class : State(name)
//
// Base class for everything the StateStack runs (levels, menus, death screens).
// A state overrides only the hooks it needs, the rest do nothing:
//
//   onEnter()    set up the state, runs when it's pushed or restarted
//   onExit()     free the state's own resources (workers, managers, globals it set)
//   onPause()    the game was paused (Esc)
//   onResume()   the game was unpaused
//   update()     runs every unpaused frame, skipped while loading is true
//   display()    draws the state every frame
//
// Game.exitState() resets timers, keybinds (bind with Game.bind), input, pause,
// CSS filters, audio, settings.shake and settings.speed when the state is left.
class State {
	constructor(name) {
		this.name = name;
		// While true the game loop skips update()
		this.loading = false;
	}

	onEnter() {}
	onExit() {}
	onPause() {}
	onResume() {}

	update() {}
	display() {}
}
