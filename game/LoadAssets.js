// Load every image in game/assets/img (including subfolders) as a global named after its file,
// e.g. game/assets/img/slayer/spr_snoop.png -> spr_snoop
// .gif files load as animated GIFs, everything else as a regular image.
(function() {
	const fs   = require('fs');
	const path = require('path');

	const imgRoot    = path.join(__dirname, 'game', 'assets', 'img');
	const imageTypes = ['.png', '.jpg', '.jpeg', '.gif'];

	// Globals whose name differs from the file they load : { global name : file name without extension }
	const aliases = {
		bg_trip_full      : 'bg_trip_full_up',
		spr_player_slayer : 'spr_player_org'
	};

	const loaded = {};

	function loadDir(dir) {
		fs.readdirSync(dir, { withFileTypes: true }).forEach(function(entry) {
			let fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) return loadDir(fullPath);

			let ext = path.extname(entry.name).toLowerCase();
			if (!imageTypes.includes(ext)) return;

			let name = path.basename(entry.name, path.extname(entry.name));
			if (loaded[name]) {
				console.warn('Duplicate asset name "' + name + '": ' + fullPath + ' ignored.');
				return;
			}
			// Image src relative to index.html
			let src = './' + path.relative(__dirname, fullPath).split(path.sep).join('/');

			loaded[name] = (ext === '.gif') ? loadGIF({ src : src }) : loadImage({ src : src });
			window[name] = loaded[name];
		});
	}

	loadDir(imgRoot);

	Object.keys(aliases).forEach(function(alias) {
		if (loaded[aliases[alias]]) window[alias] = loaded[aliases[alias]];
		else console.warn('Asset alias "' + alias + '" points to missing file "' + aliases[alias] + '".');
	});

	console.log(Object.keys(loaded).length + ' image assets loaded from ' + imgRoot);
})();
