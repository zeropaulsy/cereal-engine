function collisionBetween1(shapeA, shapeB) {
	// Quad
	if (shapeA.hitbox.type == 1) {
		// get the vectors to check against
		var vA = new Vector(shapeA.pos.x - shapeB.pos.x, shapeA.pos.y - shapeB.pos.y),
			// add the half widths and half heights of the objects
			hWidths  = (shapeA.hitbox.w / 2) + (shapeB.hitbox.w / 2),
			hHeights = (shapeA.hitbox.h / 2) + (shapeB.hitbox.h / 2),
			colDir = null;

		if (Math.abs(vA.x) < hWidths && Math.abs(vA.y) < hHeights) {
			// figures out on which side we are colliding (top, bottom, left, or right)
			var vR = new Vector(hWidths - Math.abs(vA.x), hHeights - Math.abs(vA.y));

			if (vR.x >= vR.y) {
				if (vA.y > 0) {
					colDir = "t", shapeA.pos.y += vR.y, shapeA.vel.y = shapeA.knockBack;
				} else {
					colDir = "b", shapeA.pos.y -= vR.y, shapeA.vel.y =-shapeA.knockBack;
				}
			} else {
				if (vA.x > 0) {
					colDir = "l", shapeA.pos.x += vR.x, shapeA.vel.x = shapeA.knockBack;
				} else {
					colDir = "r", shapeA.pos.x -= vR.x, shapeA.vel.x =-shapeA.knockBack;
				}
			}
		}
		return colDir;
	}
	// Circle
	if (shapeA.hitbox.type == 2 && inRangeOf(shapeA, shapeB, shapeA.hitbox.w + shapeB.hitbox.w)) {
		var dx = (shapeB.pos.x) - (shapeA.pos.x),
			dy = (shapeB.pos.y) - (shapeA.pos.y),
			angle = Math.atan2(dx, dy),
			collision = false;
		// Combined radius of the two shapes
		var radii = (shapeA.hitbox.w / 2) + (shapeB.hitbox.h / 2);
		// Compare distance to radii
		if ((dx * dx) + (dy * dy) < radii * radii && !g_paused) {
			// Move object to edge of shapeB
			shapeA.pos.x += Math.sin(angle) / radii;
			shapeA.pos.y += Math.cos(angle) / radii;
			// Set shapeA velocity to knock-back of shapeA
			shapeA.vel.x += Math.sin(angle) * -shapeA.knockBack;
			shapeA.vel.y += Math.cos(angle) * -shapeA.knockBack;
			// Store last collision in objects
			shapeA.hitbox.lastCollision = shapeB;
			shapeB.hitbox.lastCollision = shapeA;
			// Set collision to true
			collision = true;
		}
		return collision;
	}
}

function arrayCollisionBetween1(arrayA, arrayB, callback) {
	// Check for collisions between arrayA and arrayB
	for (var i = 0; i < arrayA.length; i++) {
		var a = arrayA[i];
		// Loop through second array
		for (var j = 0; j < arrayB.length; j++) {
			var b = arrayB[j];
			if (collisionBetween1(a, b)) {
				callback(a, b);
			}
		}
	}
}

function inRangeOf(shapeA, shapeB, range) {
	var dx = (shapeB.pos.x) - (shapeA.pos.x),
		dy = (shapeB.pos.y) - (shapeA.pos.y),
		angle = Math.atan2(dx, dy);
	// Combined radius of the two shapes
	var radii = (shapeA.hitbox.w / 2) + (range);
	// Compare distance to radii
	if ((dx * dx) + (dy * dy) < radii * radii && !g_paused) {
		// Store last collision in objects
		return true;
	} else {
		return false;
	}
}