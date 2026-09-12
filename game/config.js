// Game configuration, loaded last so every level and state is defined.
// The engine reads these instead of naming the game's classes itself.

// Level started when the game boots, and restarted from the death screen by default
Game.startLevel = WindowsDefender;
// State shown when the player dies, given the level class to restart into. null restarts straight away
Game.deathScreen = DeathScreen01;
