# Engine internals

How the engine works. For setup and a quick start, see the [main README](../README.md). For classes and settings, see the [reference](REFERENCE.md).

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

## Running

`npm start` runs `electron . --no-sandbox`. The `--no-sandbox` flag is needed on Linux, where Electron's `chrome-sandbox` helper isn't set up as root.

To check the game boots without errors and see its console output in the terminal:

```bash
timeout 20 ./node_modules/.bin/electron . --no-sandbox --enable-logging=stderr 2>&1 | grep -i console
```

## Files

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
```

## No modules

There's no bundler and no `import`/`export`. Scripts are loaded in order by `<script>` tags in `index.html`, and classes, sprites, sounds and managers are all globals. **When you add a file, add a script tag for it in `index.html`**, after anything it uses when it loads. `index.html` has an engine section and a game section. Levels and states go in the game section, before `game/config.js`, which always loads last.

The renderer has full Node access (`nodeIntegration`), which the asset loaders use to read the asset folders with `fs`.

## Boot and game loop

1. Electron opens a frameless window with an HTML title bar (`main.js`).
2. The asset loaders turn every image and sound into a global while the Pace loading bar runs.
3. When loading finishes, oversized sprites are prescaled, then `Game.init()` sets up the canvas and starts `Game.startLevel` (set in `game/config.js`) with `Game.startGame()`.
4. `Game.run()` runs every frame with `requestAnimationFrame`. It computes `deltaTime` (1.0 at 60fps), then updates and draws the current state.

## States

The game is a stack of states (`engine/core/setup.js`). Every state extends `State` (`engine/core/State.js`) and overrides only the hooks it needs: `onEnter`, `onExit`, `onPause`, `onResume`, `update` and `display`. Playable levels extend `Level`, which extends `State`.

Always change state through the `Game` object:

- `Game.setState(new SomeLevel())` leaves the current state and enters a new one.
- `Game.restartState()` leaves and re-enters the current state.

Both go through `Game.exitState()`, which runs the state's `onExit` and then resets everything shared: it clears timers, unbinds the state's keys, releases held input, unpauses, resets CSS filters, stops audio and resets screen shake and game speed. A state only needs to clean up what it created itself.

## Entities and collision

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

## Rendering

- Each level draws inside a `Camera`, which handles screen shake and zoom.
- `Game.resize()` fits a 1280×720 area into the window and backs the canvas at full screen resolution. With `settings.responsive`, the world grows on the spare axis instead of letterboxing.
- **Always use the globals `width` and `height` for world-space layout**, never 1280/720 or the window size.
- Drop shadows are generated on the GPU on first use and toggled with `settings.shadowsEnabled`.
- Visual effects are CSS filters on the canvas, set with `Game.setFilter('--saturate', 1.5)` and reset with `Game.resetFilters()`.
- The pause menu and title bar are HTML styled with [XP.css](https://botoxparty.github.io/XP.css/).

## Performance

Performance matters in every change, since the goal is the largest possible number of entities on screen.

- Avoid allocating objects every frame in hot paths (entity and particle loops, collision). Reuse arrays and objects.
- Measure changes with real numbers, using a benchmark or an in-game timing, rather than guessing.

Planned improvements, roughly in order: object pools for bullets and particles, `setTransform` instead of `save`/`restore` per entity, a static background layer, a single shadow pass, a stress-test key, and eventually a WebGL renderer.

## Cleanup

- The audio slider's `onclick` is assigned twice in `engine/core/Game.js`, so the first assignment never runs.
- `BackgroundScreen` stores the return value of `timerManager.addTimer`, which is always `undefined`.
- `darkenImage` and `contrastImage` in `Maths.js` are unused.
