const remote   = require('electron');
const easystar = new EasyStar.js();

//window.devicePixelRatio = 2;

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
	this.stateList.push(new State('EmptyState'));
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
	// onExit is called by Game.exitState(), which also runs the shared cleanup
	this.pop = function() {
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
