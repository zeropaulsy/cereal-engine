# Cereal Engine

A small 2D top-down shooter engine written in plain JavaScript and HTML5 Canvas, running in [Electron](https://www.electronjs.org/). It's built to keep **as many enemies, bullets and particles on screen as possible**, and to make arena shooters quick to put together.

The engine ships with **Windows Defender**, a meme-themed arena shooter: survive waves of enemies pouring in from the screen edges, using an inventory of ridiculous guns, a dash, powerups and allied turrets.

## Features

- **Entities**: player, enemies, bullets, turrets, powerups and explosions, with sprite rotation, flipping and drop shadows.
- **Fast collision**: a spatial grid per entity type, rebuilt every frame, so each entity only checks its neighbours.
- **Weapons**: a slot-based inventory of guns with their own projectile count, speed, spread, damage, fire rate, hit sound and optional explosive rounds.
- **Particles**: a capped particle system for blood, hitmarkers, explosions and effects.
- **Enemy spawners**: timed spawners whose interval can shrink over time to ramp up difficulty.
- **Turret AI**: allied turrets aim with intercept prediction, calculated in a Web Worker.
- **Global time scale**: slow motion that affects movement, timers, spawners and GIF playback together.
- **Screen effects**: camera shake and zoom, and CSS filter effects (saturation, grayscale, contrast and more).
- **Responsive display**: the game fits any window size, showing extra world on wider or taller windows instead of stretching. Optional nearest-neighbour rendering for pixel art.
- **Automatic asset loading**: drop an image or sound into the assets folder and it becomes a global you can use.
- **Level base class**: a `Level` class handles the camera, managers, spawners, death, pause, controls and cleanup, so a level only describes what's in it.
- **Optional extras**: A\* pathfinding (easystar.js) and gamepad support are built in but not enabled by default.

## Getting started

You'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/) (which includes npm).

```bash
git clone https://github.com/zeropaulsy/cereal-engine
cd cereal-engine
npm install
npm start
```

`npm start` runs `electron . --no-sandbox`. The `--no-sandbox` flag is needed on Linux, where Electron's `chrome-sandbox` helper isn't set up as root.

To check the game boots without errors and see its console output in the terminal:

```bash
timeout 20 ./node_modules/.bin/electron . --no-sandbox --enable-logging=stderr 2>&1 | grep -i console
```

## Controls

### Gameplay

| Key | Action |
|---|---|
| W A S D | Move |
| Mouse | Aim |
| Left click | Shoot |
| Space | Dash |
| 1 – 4 | Switch weapon |
| I | Spawn an allied turret |
| Y | Trippy mode |
| U | Spooky mode |
| Esc | Pause |

On the death screen, **R** or **Esc** restarts the level.

### Gamepad

The d-pad moves, the top shoulder buttons switch weapons, the bottom-left shoulder dashes and Start pauses. Analog stick movement is currently broken.

### Developer keys

| Key | Action |
|---|---|
| R | Reload the window |
| Q | Restart the current state |
| O | Print the sprite size report |

## Windows Defender

The included game, set up in `game/levels/WindowsDefender.js`.

- **Weapons**: chicken, dorito, banana and Dew guns. The Dew gun fires explosive rounds and plays music while equipped.
- **Dash**: launches the player with an emoji explosion, then a damaging explosion where the dash ends. It recharges over time.
- **Enemies**: Snoop/Steve grunts, a bigger and faster variant, and explosive Creepers whose death explosion damages other enemies. Spawns speed up over time.
- **Boss**: an "Alert" boss with 1000 HP arrives every ~500 ticks and changes sprite as it takes damage.
- **Powerups**: enemies sometimes drop a temporary weapon, +50 max health, or a joint that triggers trippy mode.
- **Trippy mode**: quarter speed, a wormhole background, boosted saturation and screen shake.
- **Spooky mode**: grayscale and high contrast, and enemies are replaced by tougher skulls.
- **Anti-camping**: stand still for too long and the screen starts shaking.

The repo also includes `Reskin.js`, a pixel art variant of the arena with staff and bow weapons, and `LevelTemplate.js`, a minimal level to copy.

## Project structure

The code is split into a reusable **engine** and the **game** built on it. The engine never names the game's classes: the game tells it which level to start, and which death screen to use, in `game/config.js`.

```
main.js                 Electron main process: window, title bar controls, aspect ratio snapping
preload.js              Electron preload script
index.html              Page layout and <script> load order
engine/
  core/
    Game.js             Settings, input state, the Game object and the main loop
    Level.js            Base class for playable levels, extends State
    State.js            Base class for all states
    setup.js            State machine (StateStack)
    Timer.js            Pausable timers (timerManager)
  entities/
    Entity.js           Base entity: position, velocity, sprites, shadows, collision
    Creature.js         Entities with health, movement and smoothed rotation
    Player.js, Enemy.js, Turret.js
    Bullet.js, Explosion.js, Powerup.js
  weapons/              Gun.js and Inventory.js: weapons and weapon slots
  systems/
    EntityManager.js    Owns all entities and their spatial grids
    SpatialGrid.js      Collision broad phase
    Collision.js, CollisionBody.js
    ParticleSystem.js, Particle.js
    EnemySpawner.js     Timed spawn callbacks
    BackgroundManager.js  Background screens, including animated GIFs
    Tile.js
  input/                Controller.js (gamepad) and KeyBinds.js (developer keys)
  assets/               LoadAssets.js (images, sprite prescaling), LoadImage.js, Sound.js
  ui/                   StatBar.js (health and dash bars) and styles.css (window, title bar, pause menu)
  util/                 Vector.js and Maths.js (random, randomInt, pathfinding, ...)
  workers/              CalculateAngle.js: Web Worker for turret aiming
  lib/                  Third-party libraries (camera, mousetrap, pace, GIF, easystar, XP.css, ...)
game/
  config.js             Start level and death screen
  levels/               WindowsDefender.js, Reskin.js, LevelTemplate.js
  states/               DeathScreen01.js
  assets/               img/, sound/sfx/, sound/music/, fonts/, video/
archive/                Old code that isn't loaded
```

## How it works

### No modules

There's no bundler and no `import`/`export`. Scripts are loaded in order by `<script>` tags in `index.html`, and classes, sprites, sounds and managers are all globals. **When you add a file, add a script tag for it in `index.html`**, after anything it uses when it loads. `index.html` has an engine section and a game section. Levels and states go in the game section, before `game/config.js`, which always loads last.

The renderer has full Node access (`nodeIntegration`), which the asset loaders use to read the asset folders with `fs`.

### Boot and game loop

1. Electron opens a frameless window with an HTML title bar (`main.js`).
2. The asset loaders turn every image and sound into a global while the Pace loading bar runs.
3. When loading finishes, oversized sprites are prescaled, then `Game.init()` sets up the canvas and starts `Game.startLevel` (set in `game/config.js`) with `Game.startGame()`.
4. `Game.run()` runs every frame with `requestAnimationFrame`. It computes `deltaTime` (1.0 at 60fps), then updates and draws the current state.

### States

The game is a stack of states (`engine/core/setup.js`). Every state extends `State` (`engine/core/State.js`) and overrides only the hooks it needs: `onEnter`, `onExit`, `onPause`, `onResume`, `update` and `display`. Playable levels extend `Level`, which extends `State`.

Always change state through the `Game` object:

- `Game.setState(new SomeLevel())` leaves the current state and enters a new one.
- `Game.restartState()` leaves and re-enters the current state.

Both go through `Game.exitState()`, which runs the state's `onExit` and then resets everything shared: it clears timers, unbinds the state's keys, releases held input, unpauses, resets CSS filters, stops audio and resets screen shake and game speed. A state only needs to clean up what it created itself.

### Entities and collision

```
Entity
├── Creature   (health, movement, smoothed rotation)
│   ├── Player
│   ├── Enemy
│   └── Turret
├── Bullet
├── Powerup
└── Explosion
```

Each entity has an `entityType` string (`'player'`, `'enemy'`, `'bullet'`, `'turret'`, `'powerup'`, `'explosion'`). The `EntityManager` keeps one spatial grid per type, rebuilt every frame with 64px cells. `entity.handleCollision(exclude, callback)` only checks nearby entities of other types, so enemies never search through other enemies.

Removed entities are flagged `removed = true` so they can't be hit again in the same frame. Arrays returned by collision queries are reused, so don't keep them.

Particles aren't entities. They're owned by the `ParticleSystem`.

### Rendering

- Each level draws inside a `Camera`, which handles screen shake and zoom.
- `Game.resize()` fits a 1280×720 area into the window and backs the canvas at full screen resolution. With `settings.responsive`, the world grows on the spare axis instead of letterboxing.
- **Always use the globals `width` and `height` for world-space layout**, never 1280/720 or the window size.
- Drop shadows are generated on the GPU on first use and toggled with `settings.shadowsEnabled`.
- Visual effects are CSS filters on the canvas, set with `Game.setFilter('--saturate', 1.5)` and reset with `Game.resetFilters()`.
- The pause menu and title bar are HTML styled with [XP.css](https://botoxparty.github.io/XP.css/).

## Making a level

Extend `Level` and override only what you need. The quickest start is to copy `game/levels/LevelTemplate.js`.

```js
class MyLevel extends Level {
	constructor() {
		super('my_level');
		// Image shown behind the canvas
		this.background = bg_windows_bliss;
		// Spawners get 0.01 ticks faster every frame, down to 10
		this.spawnRamp = 0.01;
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

	drawHud() {
		Game.c.font = '50px Comic Sans MS';
		Game.c.fillStyle = '#fff';
		Game.c.fillText('score: ' + this.score, 10, 50);
	}
}
```

Then add `<script type="text/javascript" src="./game/levels/MyLevel.js"></script>` to the game section of `index.html`, before `game/config.js`. Start it with `Game.setState(new MyLevel())`, or set `Game.startLevel = MyLevel;` in `game/config.js` to make it the first level.

### Hooks

| Hook | When it runs |
|---|---|
| `setup()` | On entering the level. Spawn the player, backgrounds and spawners here. |
| `tick()` | Every unpaused frame, for level-specific logic. |
| `drawWorld()` | After entities and particles, in world space (moves with the camera). |
| `drawHud()` | Last, in screen space, on top of everything. |
| `cleanup()` | On leaving the level. Free anything `setup()` created, like a Web Worker. |
| `dropPowerup(enemy)` | When an enemy dies and rolls a drop (`settings.powerupDropRate`). |
| `dashEvent()` | When the player dashes. |

### Options

Set these in the constructor after `super()`.

| Option | Default | Meaning |
|---|---|---|
| `background` | `null` | Image shown behind the canvas |
| `cursor` | `cur_pixel` | Image drawn at the mouse position, `null` for none |
| `hideCursor` | `true` | Hide the system cursor |
| `maxEntities` | `5000` | Entity limit |
| `maxParticles` | `1000` | Particle limit |
| `maxBackgrounds` | `10` | Background screen limit |
| `spawnRamp` | `0` | Ticks taken off every spawner's interval each frame |
| `minSpawnTime` | `10` | Shortest spawner interval |
| `deathScreen` | `Game.deathScreen` | State to show when the player dies, `null` to restart straight away. The game-wide default is set in `game/config.js`. |

### Helpers

| Helper | What it does |
|---|---|
| `spawnPlayer(sprite, x, y, width, height, health, speed, makeWeapons)` | Spawns the player, sets the global `player` and gives it an inventory. `makeWeapons(parent)` returns its guns. |
| `addBackground(id, images, alpha, gifs)` | Adds a background screen. The first one added is shown. |
| `addSpawner(spawnTime, callback)` | Adds a spawner that calls `callback` every `spawnTime` ticks. |
| `edgePoint(edge, margin)` | A random point just off the `'top'`, `'bottom'`, `'left'` or `'right'` edge. The returned Vector is reused. |
| `Game.bind(key, fn, event)` | Binds a key until the level is left. |

`Level` already binds movement, dash, weapon slots 1–5 and pause. Levels track their score in `this.score`, which enemies add to when they die.

## Assets

### Images

Every file in `game/assets/img/` (including subfolders) becomes a global named after the file, so `slayer/spr_snoop.png` becomes `spr_snoop`. `.gif` files load as animated GIFs. A file whose name isn't a valid JavaScript identifier, or would overwrite an existing global, is refused with a console error.

Use these prefixes:

| Prefix | Use |
|---|---|
| `spr_` | Sprites |
| `p_` | Particles and bullets |
| `bg_` | Backgrounds |
| `gif_` | Animations |
| `cur_` | Cursors |

At startup, `spr_` and `p_` images larger than their limit in `spriteMaxSize` (in `engine/assets/LoadAssets.js`) are shrunk to save memory and drawing time.

### Sounds

Files in `game/assets/sound/sfx/` load into `audio.<name>`, and files in `game/assets/sound/music/` into `music.<name>`, named after the file. Per-sound volumes go in the `soundVolumes` table in `engine/assets/Sound.js`.

```js
audio.mp3_hitmarker.play();
music.mp3_skrillex.play(0, 0, true);
music.mp3_skrillex.stop();
```

## Engine reference

### Constructors

| Class | Signature |
|---|---|
| `Player` | `Player(id, sprite, x, y, width, height, health, speed)` |
| `Enemy` | `Enemy(id, sprite, x, y, width, height, target, health, speed, friction, showHealthBar, deathSound, scoreValue)` |
| `Turret` | `Turret(id, sprite, targetType, x, y, width, height, health, speed, ammo)` |
| `Gun` | `Gun(id, sprite, bulletSprite, parent, bulletWidth, bulletHeight, amount, speed, dither, damage, hitSound, hitParticle, equipped)` |
| `Inventory` | `Inventory(max, contents)` |
| `Powerup` | `Powerup(id, sprite, x, y, width, height, onCollision)`. Return `true` from `onCollision` to consume it. |
| `Explosion` | `Explosion(x, y, particleWidth, particleHeight, amount, range, dither, damage, p1, p2, p3)` |
| `Particle` | `Particle(id, sprite, x, y, width, height, velocity, direction, health, dither)` |
| `EnemySpawner` | `EnemySpawner(max, spawnTime, spawnTimer, active, amount, callback)` |

### Useful properties

- **`Gun`**: `firerate`, `explosive` (bullets explode on hit), `p1`/`p2`/`p3` (explosion particles), `onEquip()`/`onHolster()`.
- **`Enemy`**: `enableRotation`, `faceTarget` (flip to face the target), `explosive` (explodes on death), `hitmarker`, `knockBack`, `hitbox`, and `sprite_dmg_enabled` with `sprite_dmg_1`/`sprite_dmg_2` (change sprite at 66% and 33% health).

### Globals

| Global | What it is |
|---|---|
| `Game` | The game object: canvas (`Game.canvas`, `Game.c`), states, key binding, filters |
| `player` | The current player |
| `entityManager` | `spawnEntity(e)`, `getEntityById(id)`, `removeEntity(e)`, `entities` |
| `particleSystem` | `spawnParticle(p)`, `particles` |
| `backgroundManager` | `selectBackgroundScreen(id)`, `screens` |
| `timerManager` | `addTimer(callback, delay)`. Timers pause with the game and are cleared when the level is left. |
| `width`, `height` | The current world size |
| `deltaTime` | Frame time, where 1.0 is one frame at 60fps |
| `settings` | Runtime settings (below) |

### Settings

Runtime settings live in the `settings` object at the top of `engine/core/Game.js`.

| Setting | Default | Meaning |
|---|---|---|
| `responsive` | `true` | Show extra world on wider or taller windows instead of letterboxing |
| `pixelated` | `false` | Nearest-neighbour scaling for pixel art |
| `particlesEnabled` | `true` | Draw particles |
| `shadowsEnabled` | `true` | Draw entity shadows |
| `shadowDistance` | `3` | Shadow offset |
| `speed` | `1` | Time scale. Lower is slow motion. |
| `shake` | `0` | Current screen shake amount |
| `powerupDropRate` | `5` | Percent chance an enemy drops a powerup |
| `pathfindingEnabled` | `true` | A\* pathfinding (levels built on `Level` turn it off) |
| `tileSize` | `64` | Pathfinding grid size |
| `logSpriteSizes` | `true` | Record the largest size each sprite is drawn at (press O for the report) |

`scale`, `paused`, `maximized`, `gamepadConnected` and `lastInput` are set by the engine.

## Performance

Performance matters in every change, since the goal is the largest possible number of entities on screen.

- Avoid allocating objects every frame in hot paths (entity and particle loops, collision). Reuse arrays and objects.
- Measure changes with real numbers, using a benchmark or an in-game timing, rather than guessing.

Planned improvements, roughly in order: object pools for bullets and particles, `setTransform` instead of `save`/`restore` per entity, a static background layer, a single shadow pass, a stress-test key, and eventually a WebGL renderer.

## Known issues

Bugs:

- Gamepad analog movement throws an error. `Player.update` calls `moveTo` without `this`, and passes Vectors where angles are expected.
- `Creature.setSize` crashes on anything other than the player, because it resizes a dash bar only the player has.
- Entity ids are built from the entity count (`'enemy' + entities.length`), so they aren't unique after removals. `getEntityById` and the turret aiming lookup can match the wrong entity.
- The `Enemy` constructor ignores its `showHealthBar` argument and always sets it to `false`, so enemy health bars never show.
- `Bullet.js` checks `this.rotation == NaN`, which is always false. It should use `isNaN`.

Cleanup:

- The audio slider's `onclick` is assigned twice in `engine/core/Game.js`, so the first assignment never runs.
- `BackgroundScreen` stores the return value of `timerManager.addTimer`, which is always `undefined`.
- `archive/PowerupScripts.js` isn't valid JavaScript, and `archive/AudioAnalyser.js` is unused. Neither is loaded.
- `darkenImage` and `contrastImage` in `Maths.js` are unused.

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
