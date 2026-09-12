// Pizzicato audio library variables / effects
let reverb = new Pizzicato.Effects.Reverb({
    time: 1,
    decay: 2,
    reverse: false,
    mix: 0.75
});
let delay = new Pizzicato.Effects.DubDelay({
    feedback: 0.2,
    time: 0.5,
    mix: 0.5,
	cutoff: 700
});
// let audioIn = new Pizzicato.Sound({
// 	source: 'input',
// 	options: { volume: 1 }
// });

// Volumes for sounds that shouldn't play at full volume : { file name without extension : volume }
const soundVolumes = {
	mp3_fart : 0.5
};

let audioLoaded = false;
let audioArray  = [];
let musicArray  = [];
let audio       = new preloadAudio('soundfx');
let music       = new preloadAudio( 'music' );

let activeSounds;

function createAudioGroup(group, array) {
	group.Group = new Pizzicato.Group(array);
}

function getActiveSounds() {
	activeSounds = [];
	for (let i = 0; i < audioArray.length; i++) {
		if (audioArray[i].playing) activeSounds.push(audioArray[i]);
	}
	for (let i = 0; i < musicArray.length; i++) {
		if (musicArray[i].playing) activeSounds.push(musicArray[i]);
	}
	return activeSounds;
}

function pauseActiveSounds() {
	activeSounds = getActiveSounds();
	for (let i = 0; i < activeSounds.length; i++) {
		activeSounds[i].pause();
	}
}

function resumeActiveSounds() {
	for (let i = 0; i < activeSounds.length; i++) {
		activeSounds[i].play();
	}
}

function audioTrack(url, type, volume) {
	var audio = new Pizzicato.Sound(url, function() {

		if (type == 'soundfx') audioArray.push(audio);
		if (type ==  'music' ) musicArray.push(audio);

		console.log(url + ' loaded.');
	});

	audio.volume = volume || 1;

	this.src    = audio;
	this.muted  = true;

    var looping = false;
    this.play = function(delay, position, noResetTime) {
        playSound(delay, position, noResetTime);
    };
    this.startLoop = function(noResetTime) {
        if (looping) return;
		audio.on('end', audioLoop);
        audioLoop(noResetTime);
        looping = true;
    };
    this.stopLoop = function(noResetTime) {
        try{ audio.removeEventListener('ended', audioLoop) } catch (e) {};
        audio.pause();
        if (!noResetTime) audio.currentTime = 0;
        looping = false;
    };
    this.isPlaying = function() {
        return audio.playing;
    };
    this.isPaused = function() {
        return audio.paused;
    };
    this.stop = this.stopLoop;

    function audioLoop(noResetTime) {
        playSound(noResetTime);
    }
    function playSound(delay, position, noResetTime) {
        // for really rapid sound repeat set noResetTime
        if(!audio.isPaused && noResetTime) {
			audio.pause();
        	if (noResetTime) audio.stop();
        }
        try{
            var playPromise = audio.play(delay, position);
            if(playPromise) {
                playPromise.then(function(){}).catch(function(err){});
            }
        }
        catch(err){ console.error(err) }
	}
}

// Load every sound in the folder for this type, named after its file
// e.g. game/assets/sound/sfx/mp3_pop.mp3 -> audio.mp3_pop
function preloadAudio(type) {
	const fs   = require('fs');
	const path = require('path');

	const folders    = { soundfx : 'sfx', music : 'music' };
	const soundTypes = ['.mp3', '.wav', '.ogg'];
	const dir = path.join(__dirname, 'game', 'assets', 'sound', folders[type]);

	fs.readdirSync(dir).sort().forEach(file => {
		let ext = path.extname(file).toLowerCase();
		if (!soundTypes.includes(ext)) return;

		let name = path.basename(file, path.extname(file));
		// Sound src relative to index.html
		let src = './game/assets/sound/' + folders[type] + '/' + file;

		this[name] = new audioTrack(src, type, soundVolumes[name]);
	});
}
