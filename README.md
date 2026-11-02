# Cereal Engine

A small 2D top-down shooter engine in plain JavaScript and HTML5 Canvas, running in [Electron](https://www.electronjs.org/). It's built to keep **as many enemies, bullets and particles on screen as possible**, and to make arena shooters quick to put together.

It ships with **Windows Defender**, a meme-themed arena shooter: survive waves of enemies using ridiculous guns, a dash, powerups and allied turrets.

## Getting started

You'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/).

```bash
git clone https://github.com/zeropaulsy/cereal-engine
cd cereal-engine
npm install
npm start
```

## Controls

| Key | Action |
|---|---|
| W A S D | Move |
| Mouse / left click | Aim / shoot |
| Space | Dash |
| 1 – 4 | Switch weapon |
| I | Spawn an allied turret |
| Y / U | Trippy / spooky mode |
| Esc | Pause |
| R, Q, O | Dev: reload window, restart state, print sprite size report |

On the death screen, **R** or **Esc** restarts the level. On a gamepad, the d-pad moves, the top shoulders switch weapons, the bottom-left shoulder dashes and Start pauses.

## Project structure

The reusable **engine** never names the **game's** classes. The game sets its start level and death screen in `game/config.js`.

```
main.js, preload.js   Electron window and preload
index.html            Page layout and <script> load order
engine/
  core/               Game object and main loop, State, Level, timers
  entities/           Entity, Creature, Player, Enemy, Turret, Bullet, Explosion, Powerup
  weapons/            Gun, Inventory
  systems/            EntityManager, spatial grid, collision, particles, spawners, backgrounds
  input/, assets/, ui/, util/, workers/, lib/
game/
  config.js           Start level and death screen
  levels/             WindowsDefender, Reskin, LevelTemplate
  states/             DeathScreen01
  assets/             img/, sound/sfx/, sound/music/, fonts/, video/
archive/              Old code that isn't loaded
```

## Rules to know

- **No modules.** Scripts load in order from `<script>` tags, and classes, sprites, sounds and managers are all globals. When you add a file, add a tag for it in `index.html`. Levels and states go in the game section, before `game/config.js`, which always loads last.
- **Change state through `Game`**, with `Game.setState(new SomeLevel())` or `Game.restartState()`. Leaving a state clears shared timers, key binds, filters, audio and shake, so a state only cleans up what it created.
- **Use the globals `width` and `height` for world-space layout**, never 1280/720 or the window size. The world grows to fit the window.
- **Don't keep arrays from collision queries**, or the Vector from `edgePoint()`. They're reused.
- **Avoid allocating per frame in hot paths** (entity and particle loops, collision), and measure performance changes rather than guessing.

## Making a level

Copy `game/levels/LevelTemplate.js`, or extend `Level` and override only what you need:

```js
class MyLevel extends Level {
	constructor() {
		super('my_level');
		this.background = bg_windows_bliss;
		this.spawnRamp = 0.01; // Spawners get this many ticks faster every frame
	}

	setup() {
		this.addBackground('bliss', [bg_windows_bliss]);

		this.spawnPlayer(spr_player_gates, width / 2, height - 64, 64, 64, 100, 7, (parent) => [
			new Gun('chicken_gun', spr_chicken_gun, p_chicken, parent, 24, 16, 1, 20, 1, 15, audio.mp3_hitmarker, p_hitmarker, false)
		]);

		this.addSpawner(55, () => {
			let p = this.edgePoint('top');
			entityManager.spawnEntity(new Enemy('enemy' + entityManager.entities.length, spr_steve,
				p.x, p.y, 65, 65, player, 10, 2, 0.875, false, audio.mp3_hitmarker, 1));
		});
	}
}
```

Add a script tag for it to `index.html`, then set `Game.startLevel = MyLevel;` in `game/config.js` to boot into it.

| Hook | When it runs |
|---|---|
| `setup()` | On entering the level |
| `tick()` | Every unpaused frame |
| `drawWorld()` | After entities and particles, in world space |
| `drawHud()` | Last, in screen space |
| `cleanup()` | On leaving the level, to free anything `setup()` created |
| `dropPowerup(enemy)` | When an enemy dies and rolls a drop |
| `dashEvent()` | When the player dashes |

Level options, helpers and runtime settings are in the [engine reference](engine/REFERENCE.md).

## Assets

Files are picked up automatically, with no registration needed.

- **Images**: every file in `game/assets/img/` becomes a global named after the file, so `slayer/spr_snoop.png` is `spr_snoop`. Name them with a prefix: `spr_` sprites, `p_` particles and bullets, `bg_` backgrounds, `gif_` animations, `cur_` cursors.
- **Sounds**: files in `game/assets/sound/sfx/` load into `audio.<name>`, and files in `sound/music/` into `music.<name>`. Per-sound volumes are in `engine/assets/Sound.js`.

## More docs

- [Engine internals](engine/README.md): features, boot, states, collision, rendering and performance
- [Engine reference](engine/REFERENCE.md): level options and helpers, constructors, globals and settings
- [Windows Defender](game/README.md): what's in the included game
- [Assets](game/assets/README.md): naming, prescaling and playing sounds

## Known issues

- Gamepad analog movement throws an error: `Player.update` calls `moveTo` without `this` and passes Vectors where angles are expected.
- `Creature.setSize` crashes on anything but the player, because it resizes a dash bar only the player has.
- Entity ids come from the entity count, so they aren't unique after removals, and `getEntityById` can match the wrong entity.
- `Enemy` ignores its `showHealthBar` argument, so enemy health bars never show.
- `Bullet.js` checks `this.rotation == NaN`, which is always false.

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
