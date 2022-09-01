const remote   = require('electron');
const easystar = new EasyStar.js();

//window.devicePixelRatio = 2;

var EmptyState = function() {
	this.name = "EmptyState";

	this.update = function() {};
	this.display = function() {};

	this.onEnter = function() {};
	this.onExit = function() {};

	this.onPause = function() {}
	this.onResume = function() {}
}

var State = function() {
	this.name;

	this.update = function() {}
	this.display = function() {}

	this.onEnter = function() {}
	this.onExit = function() {}

	this.onPause = function() {}
	this.onResume = function() {}
}

var StateList = function() {
	this.states = [];
	this.pop = function() {
		return this.states.pop();
	}
	this.push = function(state) {
		this.states.push(state);
	}
	this.top = function() {
		return this.states[this.states.length - 1];
	}
}

var StateStack = function() {
	this.stateList = new StateList();
	this.stateList.push(new EmptyState());
	this.update = function() {
		var state = this.stateList.top();
		if (state) {
			state.update();
		}
	}
	this.display = function() {
		var state = this.stateList.top();
		if (state) {
			state.display();
		}
	}
	this.run = function() {
		var state = this.stateList.top();
		if (state) {
			state.run();
		}
	}
	this.push = function(state) {
		this.stateList.push(state);
		state.onEnter();
	}
	this.pop = function() {
		var state = this.stateList.top();
		state.onExit();
		return this.stateList.pop();
	}

	this.pause = function() {
		var state = this.stateList.top();
		if (state.onPause) {
			state.onPause();
		}
	}
	this.resume = function() {
		var state = this.stateList.top();
		if (state.onResume) {
			state.onResume();
		}
	}
};
