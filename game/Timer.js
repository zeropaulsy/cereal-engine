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
		}, delay);
	};

	this.resume();
}
