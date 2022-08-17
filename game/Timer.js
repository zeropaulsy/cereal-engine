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
			timerManager.removeTimer(self);
		}, delay);
	};

	this.resume();
}

class TimerManager {
	constructor() {
		this.timers = [];
	}
	pauseTimers() {
		for (let i = 0; i < this.timers.length; i++) {
			this.timers[i].pause();
		}
	}
	resumeTimers() {
		for (let i = 0; i < this.timers.length; i++) {
			this.timers[i].resume();
		}
	}
	addTimer(callback, delay) {
		this.timers.push(new Timer(function() { callback() }, delay));
	}
	removeTimer(index) {
		// Remove timer from TimerManager
		let i = this.timers.indexOf(index);
		if (i !== -1) {
			this.timers.splice(i, 1);
		}
	}
}