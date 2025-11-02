// Turret worker : receives every turret and potential target in one message,
// picks the closest target for each turret and returns an intercept angle per turret id
self.addEventListener('message', function(e) {
	var turrets = e.data.turrets;
	var targets = e.data.targets;
	var results = [];

	for (var i = 0; i < turrets.length; i++) {
		var t = turrets[i];
		// Find closest target of the type this turret is hunting
		var best = null, bestD = Infinity;
		for (var j = 0; j < targets.length; j++) {
			var o = targets[j];
			if (o.type !== t.targetType) continue;
			var dx = o.x - t.x, dy = o.y - t.y, d = dx * dx + dy * dy;
			if (d < bestD) {
				bestD = d;
				best = o;
			}
		}
		results.push({
			id: t.id,
			angle: best ? interceptAngle(t, best, t.speed) : null
		});
	}

	// Post results back to main thread
	self.postMessage(results);
}, false);

function interceptAngle(t, o, speed) {
	// Find the vector AB
	var dx = o.x - t.x, dy = o.y - t.y;
	var mag = Math.sqrt(dx * dx + dy * dy);
	if (mag === 0) return 0;
	// Normalize it
	var ux = dx / mag, uy = dy / mag;
	// Project target velocity onto AB, subtract to get the perpendicular component
	var along = ux * o.vx + uy * o.vy;
	var vix = o.vx - along * ux;
	var viy = o.vy - along * uy;
	// Magnitude left over for the bullet along AB
	var vjSq = speed * speed - (vix * vix + viy * viy);
	// Target is too fast to intercept, aim straight at it instead
	if (vjSq < 0) return Math.atan2(dy, dx);
	var vj = Math.sqrt(vjSq);
	// Add vj and vi to get bullet velocity
	return Math.atan2(uy * vj + viy, ux * vj + vix);
}
