// Backgrounds
let bg_trip_full = loadImage({ src : './game/assets/img/bg_trip_full.jpg', maxSeconds : 10 });
let bg_trip      = loadImage({ src : './game/assets/img/bg_trip.jpg',      maxSeconds : 10 });
let bg_level_01  = loadImage({ src : './game/assets/img/bg_level_01.png',  maxSeconds : 10 });
let bg_level_02  = loadImage({ src : './game/assets/img/bg_level_02.png',  maxSeconds : 10 });

// Sprites
let spr_player_01    = loadImage({ src : './game/assets/img/spr_player_01.png',    maxSeconds : 10 });
let spr_player_02    = loadImage({ src : './game/assets/img/spr_player_02.png',    maxSeconds : 10 });
let spr_staff_red    = loadImage({ src : './game/assets/img/spr_staff_red.png',    maxSeconds : 10 });
let spr_staff_blue   = loadImage({ src : './game/assets/img/spr_staff_blue.png',   maxSeconds : 10 });
let spr_staff_orange = loadImage({ src : './game/assets/img/spr_staff_orange.png', maxSeconds : 10 });
let spr_bow_01       = loadImage({ src : './game/assets/img/spr_bow_01.png',       maxSeconds : 10 });
let spr_enemy        = loadImage({ src : './game/assets/img/spr_enemy.png',        maxSeconds : 10 });
let spr_enemy_02     = loadImage({ src : './game/assets/img/spr_enemy_02.png',     maxSeconds : 10 });
let spr_enemy_03     = loadImage({ src : './game/assets/img/spr_enemy_03.png',     maxSeconds : 10 });
let spr_box          = loadImage({ src : './game/assets/img/spr_box.png',          maxSeconds : 10 });
let spr_shadow       = loadImage({ src : './game/assets/img/spr_shadow.png',       maxSeconds : 10 });
let spr_bomb         = loadImage({ src : './game/assets/img/spr_bomb.png',         maxSeconds : 10 });
let spr_bubble       = loadImage({ src : './game/assets/img/spr_bubble.png',       maxSeconds : 10 });

// Particles
let p_blue        = loadImage({ src : './game/assets/img/p_blue.png',        maxSeconds : 10 });
let p_orange      = loadImage({ src : './game/assets/img/p_orange.png',      maxSeconds : 10 });
let p_white       = loadImage({ src : './game/assets/img/p_white.png',       maxSeconds : 10 });
let p_red_small   = loadImage({ src : './game/assets/img/p_red_small.png',   maxSeconds : 10 });
let p_brown_small = loadImage({ src : './game/assets/img/p_brown_small.png', maxSeconds : 10 });
let p_dagger_01   = loadImage({ src : './game/assets/img/p_dagger_01.png',   maxSeconds : 10 });
let p_plus_1      = loadImage({ src : './game/assets/img/p_plus_1.png',      maxSeconds : 10 });

// Videos
let vid_tunnel = document.getElementById('vid_tunnel');

// Tilesheets
let ts_map = loadImage({ src : './game/assets/img/ts_map.png', maxSeconds : 10 });

// Snoop Slayer Assets
let spr_player_slayer = loadImage({ src : './game/assets/img/slayer/spr_player_org.png',  maxSeconds : 10 });
let spr_chicken_gun   = loadImage({ src : './game/assets/img/slayer/spr_chicken_gun.png', maxSeconds : 10 });
let spr_dorito_gun    = loadImage({ src : './game/assets/img/slayer/spr_dorito_gun.png',  maxSeconds : 10 });
let spr_banana_gun    = loadImage({ src : './game/assets/img/slayer/spr_banana_gun.png',  maxSeconds : 10 });
let spr_dew_gun       = loadImage({ src : './game/assets/img/slayer/spr_dew_gun.png',     maxSeconds : 10 });
let spr_dew_logo      = loadImage({ src : './game/assets/img/slayer/spr_dew_logo.png',    maxSeconds : 10 });
let spr_snoop         = loadImage({ src : './game/assets/img/slayer/spr_snoop.png',       maxSeconds : 10 });
let spr_misc_bag      = loadImage({ src : './game/assets/img/slayer/spr_misc_bag.png',    maxSeconds : 10 });
let spr_hypercam      = loadImage({ src : './game/assets/img/slayer/spr_hypercam.png',    maxSeconds : 10 });
let spr_alert_boss_1  = loadImage({ src : './game/assets/img/slayer/spr_alert_boss_1.png',maxSeconds : 10 });
let spr_alert_boss_2  = loadImage({ src : './game/assets/img/slayer/spr_alert_boss_2.png',maxSeconds : 10 });
let spr_alert_boss_3  = loadImage({ src : './game/assets/img/slayer/spr_alert_boss_3.png',maxSeconds : 10 });
let spr_hot_emoji     = loadImage({ src : './game/assets/img/slayer/spr_hot_emoji.png',   maxSeconds : 10 });
let spr_lip_emoji     = loadImage({ src : './game/assets/img/slayer/spr_lip_emoji.png',   maxSeconds : 10 });
let spr_dash_emoji    = loadImage({ src : './game/assets/img/slayer/spr_dash_emoji.png',  maxSeconds : 10 });

let p_hitmarker = loadImage({ src : './game/assets/img/slayer/p_hitmarker.png', maxSeconds : 10 });
let p_banana    = loadImage({ src : './game/assets/img/slayer/p_banana.png',    maxSeconds : 10 });
let p_dorito    = loadImage({ src : './game/assets/img/slayer/p_dorito.png',    maxSeconds : 10 });
let p_chicken   = loadImage({ src : './game/assets/img/slayer/p_chicken.png',   maxSeconds : 10 });
let p_dew_can   = loadImage({ src : './game/assets/img/slayer/p_dew_can.png',   maxSeconds : 10 });
let p_explosion = loadImage({ src : './game/assets/img/slayer/p_explosion.png', maxSeconds : 10 });

let bg_windows_bliss = loadImage({ src : './game/assets/img/slayer/bg_windows_bliss.jpg', maxSeconds : 10 });

// Cursors
var cur_pixel = loadImage({ src : './game/assets/img/cur_pixel.png', maxSeconds : 10 });

// Audio
/*
var audio.mp3_hitmarker = new Audio('./game/assets/sound/audio.mp3_hitmarker.mp3');
audio.mp3_hitmarker.volume = 0.1;

var audio.wav_hit = new Audio('./game/assets/sound/audio.wav_hit.wav');
audio.wav_hit.volume = 0.5;

var audio.mp3_spooky_song = new Audio('./game/assets/sound/audio.mp3_spooky_song.mp3');
audio.mp3_spooky_song.volume = 0.5;

var audio.mp3_hurt = new Audio('./game/assets/sound/audio.mp3_hurt.mp3');
audio.mp3_hurt.volume = 0.5;

var audio.mp3_smoke_weed = new Audio('./game/assets/sound/audio.mp3_smoke_weed.mp3');
*/
