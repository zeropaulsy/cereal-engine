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

function preloadAudio(type) {
	if (type == 'soundfx') {
		this.mp3_hitmarker 	 = new audioTrack('./game/assets/sound/mp3_hitmarker.mp3', type);
		this.wav_hit 		 = new audioTrack('./game/assets/sound/wav_hit.wav', type);
		this.mp3_hurt 		 = new audioTrack('./game/assets/sound/mp3_hurt.mp3', type);
		this.mp3_smoke_weed  = new audioTrack('./game/assets/sound/mp3_smoke_weed.mp3', type);
		this.mp3_vine_boom   = new audioTrack('./game/assets/sound/mp3_vine_boom.mp3', type);
        this.mp3_fart        = new audioTrack('./game/assets/sound/mp3_fart.mp3', type, 0.5);
        this.mp3_bruh        = new audioTrack('./game/assets/sound/mp3_bruh.mp3', type);
        this.mp3_pop         = new audioTrack('./game/assets/sound/mp3_pop.mp3', type, 1);
	}
	if (type == 'music') {
		this.mp3_snoop_train = new audioTrack('./game/assets/sound/mp3_snoop_train.mp3', type);
		this.mp3_sad_violin  = new audioTrack('./game/assets/sound/mp3_sad_violin.mp3', type);
		this.mp3_spooky_song = new audioTrack('./game/assets/sound/mp3_spooky_song.mp3', type);
		this.mp3_skrillex    = new audioTrack('./game/assets/sound/mp3_skrillex.mp3', type);
	}
}
