function findEntityPath(e, t) {
	// easystar js
	if ( !inRangeOf(e, t, g_tileSize * 2) ) {
		e.pathfinding = true;
		e.pathInstanceId = easystar.findPath(e.tile.x/g_tileSize, e.tile.y/g_tileSize, t.tile.x/g_tileSize, t.tile.y/g_tileSize, function(path) {
			if (path === null) {
				console.log("Path was not found. " + path);
			} else {
				e.path = path;
				easystar.cancelPath(e.pathInstanceId);
			}
		});
	} else {
		easystar.cancelPath(e.pathInstanceId);
		e.pathfinding = false;
	}
}

function normalize(val, min, max) {
	return (val - min) / (max - min);
}

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function decimalPlace(num, val) {
	return Math.round(num * val) / val;
}

function averageNums(a, b, f) {
	var avg = ( Math.atan2( Math.sin(a) * (f) + Math.sin(b) * (1 - f), Math.cos(a) * (f) + Math.cos(b) * (1 - f) ) );
	return avg;
}

function applyDeadzone(number, threshold) {
	percentage = (Math.abs(number) - threshold) / (1 - threshold);

	if (percentage < 0)
		percentage = 0;

	return percentage * (number > 0 ? 1 : -1);
}

let alternate = (function iife() {
    let lastValue = true;
    return function () {
        lastValue = !lastValue;
        return lastValue;
    };
}());
