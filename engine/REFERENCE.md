# Engine reference

## Level options

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

## Level helpers

| Helper | What it does |
|---|---|
| `spawnPlayer(sprite, x, y, width, height, health, speed, makeWeapons)` | Spawns the player, sets the global `player` and gives it an inventory. `makeWeapons(parent)` returns its guns. |
| `addBackground(id, images, alpha, gifs)` | Adds a background screen. The first one added is shown. |
| `addSpawner(spawnTime, callback)` | Adds a spawner that calls `callback` every `spawnTime` ticks. |
| `edgePoint(edge, margin)` | A random point just off the `'top'`, `'bottom'`, `'left'` or `'right'` edge. The returned Vector is reused. |
| `Game.bind(key, fn, event)` | Binds a key until the level is left. |

`Level` already binds movement, dash, weapon slots 1–5 and pause. Levels track their score in `this.score`, which enemies add to when they die.

Draw a HUD by overriding `drawHud()`:

```js
drawHud() {
	Game.c.font = '50px Comic Sans MS';
	Game.c.fillStyle = '#fff';
	Game.c.fillText('score: ' + this.score, 10, 50);
}
```

## Constructors

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

## Useful properties

- **`Gun`**: `firerate`, `explosive` (bullets explode on hit), `p1`/`p2`/`p3` (explosion particles), `onEquip()`/`onHolster()`.
- **`Enemy`**: `enableRotation`, `faceTarget` (flip to face the target), `explosive` (explodes on death), `hitmarker`, `knockBack`, `hitbox`, and `sprite_dmg_enabled` with `sprite_dmg_1`/`sprite_dmg_2` (change sprite at 66% and 33% health).

## Globals

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

## Settings

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
