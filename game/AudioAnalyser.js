class AudioAnalyser {
	constructor(source, minDb, maxDb, smoothing, ftt, monitor) {
		let self = this;

		this.monitor  = monitor;
		this.context  = Pizzicato.context;
		this.analyser = Pizzicato.context.createAnalyser();

		this.analyser.minDecibels = minDb;
		this.analyser.maxDecibels = maxDb;
		this.analyser.smoothingTimeConstant = smoothing;

		this.source = Pizzicato.context.createMediaStreamSource(source.getRawSourceNode().mediaStream);
		this.source.connect(this.analyser);
		if (this.monitor) this.source.connect(this.context.destination);

		this.smoothing = smoothing;
		this.ftt       = ftt;
		this.data      = new Uint8Array(this.analyser.frequencyBinCount);

		this.low  = 0;
		this.mid  = 0;
		this.high = 0;

		this.signal_volume = 0;
	}
	run() {
		this.analyser.getByteFrequencyData(this.data);

		this.signal_volume = this.getVolume() * 5;

		this.low  = this.getBand(1);
		this.mid  = this.getBand(2);
		this.high = this.getBand(3);
	}
	getVolume() {
		let values = 0;
	    let average;

	    let length = this.data.length;

	    // Get all the frequency amplitudes
	    for (let i = 0; i < length; i++) {
	        values += this.data[i];
	    }

	    average = values / length;
	    return average;
	}
	getBand(band) {
		let values = 0;
	    let average;

		let min, max;
	    let length = this.data.length;
		let size = Math.round(length / 3);

		if (band == 1) min = 0,        max = min + size;
		if (band == 2) min = size,     max = min + size;
		if (band == 3) min = size * 2, max = min + size;

	    // Get all the frequency amplitudes
	    for (let i = min; i < max; i++) {
	        values += this.data[i];
	    }

	    average = values / size;
	    return average;
	}
	setSmoothingTime(time) {
		return this.analyser.smoothingTimeConstant = time;
	}
	setMinDecibels(db) {
		return this.analyser.minDecibels = db;
	}
	setMaxDecibels(db) {
		return this.analyser.maxDecibels = db;
	}
}
