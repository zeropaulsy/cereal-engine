// Load every image in game/assets/img (including subfolders) as a global named after its file,
// e.g. game/assets/img/slayer/spr_snoop.png -> spr_snoop
// .gif files load as animated GIFs, everything else as a regular image.
const fs   = require('fs');
const path = require('path');

const imgRoot    = path.join(__dirname, 'game', 'assets', 'img');
const imageTypes = ['.png', '.jpg', '.jpeg', '.gif'];

// Globals whose name differs from the file they load : { global name : file name without extension }
const assetAliases = {
	bg_trip_full      : 'bg_trip_full_up',
	spr_player_slayer : 'spr_player_org'
};

// Largest size (game pixels, longest side) each sprite is drawn at. Sprites are shrunk to this at load,
// multiplied by the screen's pixel density. Measure with spriteSizeReport() and adjust.
const spriteMaxSize = {
	default          : 128,
	spr_alert_boss_1 : 512,
	spr_alert_boss_2 : 512,
	spr_alert_boss_3 : 512
};

// Only these are prescaled. Backgrounds (bg_) use .src for the CSS background, GIFs animate.
const prescalePattern = /^(spr_|p_)/;

const loadedImages = {};
// Every global an image was assigned to : { global name : image }
const assetGlobals = new Map();

// Check whether a global name is already taken, either as a window property (browser built-ins, libraries,
// var and function declarations) or as a let, const or class declaration, which window can't see
function globalNameTaken(name) {
	if (name in window) return 'already defined';
	try {
		(0, eval)(name);
		return 'already declared';
	} catch (err) {
		// A ReferenceError means nothing is bound to the name
		return (err instanceof ReferenceError) ? null : 'not a valid identifier';
	}
}

// Assign an image to a global, refusing names that aren't identifiers or are already in use.
// Names already owned by an asset can be reassigned, so aliases can replace a file's global.
function assignAssetGlobal(name, img, source) {
	if (!/^[A-Za-z_$][\w$]*$/.test(name)) {
		console.error('Asset "' + name + '" (' + source + ') not made global: not a valid identifier.');
		return;
	}
	if (!assetGlobals.has(name)) {
		let reason = globalNameTaken(name);
		if (reason) {
			console.error('Asset "' + name + '" (' + source + ') not made global: name ' + reason + '. Rename the file.');
			return;
		}
	}
	window[name] = img;
	assetGlobals.set(name, img);
}

(function() {
	function loadDir(dir) {
		fs.readdirSync(dir, { withFileTypes: true }).forEach(function(entry) {
			let fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) return loadDir(fullPath);

			let ext = path.extname(entry.name).toLowerCase();
			if (!imageTypes.includes(ext)) return;

			let name = path.basename(entry.name, path.extname(entry.name));
			if (loadedImages[name]) {
				console.warn('Duplicate asset name "' + name + '": ' + fullPath + ' ignored.');
				return;
			}
			// Image src relative to index.html
			let src = './' + path.relative(__dirname, fullPath).split(path.sep).join('/');

			loadedImages[name] = (ext === '.gif') ? loadGIF({ src : src }) : loadImage({ src : src });
			assignAssetGlobal(name, loadedImages[name], fullPath);
		});
	}

	loadDir(imgRoot);

	Object.keys(assetAliases).forEach(function(alias) {
		if (loadedImages[assetAliases[alias]]) assignAssetGlobal(alias, loadedImages[assetAliases[alias]], 'alias of ' + assetAliases[alias]);
		else console.warn('Asset alias "' + alias + '" points to missing file "' + assetAliases[alias] + '".');
	});

	console.log(Object.keys(loadedImages).length + ' image assets loaded from ' + imgRoot);
})();

// Every global name an image is reachable by (its file name plus any aliases)
function spriteGlobalNames() {
	return Array.from(assetGlobals.keys());
}

// Scripts load after this file, so a later var, function or class with an asset's name can still take it over.
// Call once every script has loaded to report asset globals that no longer resolve to their image.
function checkAssetGlobals() {
	assetGlobals.forEach((img, name) => {
		let value;
		try { value = (0, eval)(name); } catch (err) {}
		if (value !== img) console.error('Asset global "' + name + '" was overwritten by a script. Rename the file or the variable.');
	});
}

// Shrink oversized sprites to the size they are actually drawn at. Call once all images have loaded.
async function prescaleSprites() {
	console.time('Prescale sprites');
	// In responsive mode the world grows with the window, so only pixel density scales sprites up
	const screenScale = window.devicePixelRatio * (g_responsive ? 1 : Math.max(1, window.screen.width / width));

	// Group names by image so aliases share one scaled copy
	const groups = new Map();
	spriteGlobalNames().forEach(name => {
		if (!prescalePattern.test(name)) return;
		const img = window[name];
		if (!(img instanceof HTMLImageElement)) return;
		if (!groups.has(img)) groups.set(img, []);
		groups.get(img).push(name);
	});

	let scaled = 0;
	await Promise.all(Array.from(groups, async ([img, names]) => {
		try {
			await img.decode();
		} catch (err) {
			console.warn('Could not decode ' + names[0] + ', left unscaled.');
			return;
		}
		const maxSize = Math.max(...names.map(n => spriteMaxSize[n] || spriteMaxSize.default)) * screenScale;
		const scale   = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
		if (scale === 1) return;

		const bitmap = await createImageBitmap(img, {
			resizeWidth   : Math.max(1, Math.round(img.naturalWidth  * scale)),
			resizeHeight  : Math.max(1, Math.round(img.naturalHeight * scale)),
			resizeQuality : 'high'
		});
		// Keep the original size around for spriteSizeReport()
		bitmap.sourceWidth  = img.naturalWidth;
		bitmap.sourceHeight = img.naturalHeight;
		names.forEach(name => {
			window[name] = bitmap;
			assetGlobals.set(name, bitmap);
		});
		scaled++;
	}));
	console.timeEnd('Prescale sprites');
	console.log(scaled + ' sprites prescaled (screen scale ' + screenScale + ').');
}

// --- Temporary sprite size logging, enabled with g_log_sprite_sizes ---

// Record the largest size (game pixels, longest side) a sprite is drawn at
function recordSpriteSize(sprite, w, h) {
	let size = Math.max(Math.abs(w), Math.abs(h));
	if (!(sprite._maxDrawn >= size)) sprite._maxDrawn = size;
}

// Print a table comparing each sprite's prescaled size to the largest size it has been drawn at.
// Run spriteSizeReport() in the DevTools console, or press O in game.
function spriteSizeReport() {
	const rows = {};
	spriteGlobalNames().forEach(name => {
		if (!prescalePattern.test(name)) return;
		const s = window[name];
		const cap = spriteMaxSize[name] || spriteMaxSize.default;
		const drawn = s._maxDrawn ? Math.ceil(s._maxDrawn) : null;
		let verdict = 'not drawn yet';
		if (drawn) {
			if (drawn > cap) verdict = 'TOO SMALL, raise to ' + drawn;
			else if (drawn < cap / 2) verdict = 'could lower to ' + drawn;
			else verdict = 'ok';
		}
		rows[name] = {
			source  : (s.sourceWidth  || s.naturalWidth  || s.width) + 'x' + (s.sourceHeight || s.naturalHeight || s.height),
			loaded  : s.width + 'x' + s.height,
			maxSize : cap,
			maxDrawn: drawn,
			verdict : verdict
		};
	});
	console.table(rows);
	return rows;
}
