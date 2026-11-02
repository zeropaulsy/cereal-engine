# Assets

## Images

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

## Sounds

Files in `game/assets/sound/sfx/` load into `audio.<name>`, and files in `game/assets/sound/music/` into `music.<name>`, named after the file. Per-sound volumes go in the `soundVolumes` table in `engine/assets/Sound.js`.

```js
audio.mp3_hitmarker.play();
music.mp3_skrillex.play(0, 0, true);
music.mp3_skrillex.stop();
```
