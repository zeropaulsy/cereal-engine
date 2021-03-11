class Explosion {
	constructor(x, y, pWidth, pHeight, amount, range, dither, damage, p1, p2, p3) {
		this.pos = new Vector(x, y);
		this.pWidth = pWidth;
		this.pHeight = pHeight;
		this.hitbox = {w: range, h: range};
		this.amount = amount;
		this.range = range;
		this.dither = dither;
		this.damage = damage;
		this.p1 = p1 || p_white;
		this.p2 = p2 || p_orange;
		this.p3 = p3 || p_red_small;
		this.explode();
	}
	explode() {
		// Shake screen
		g_shake += 3;
		let timer = new Timer(function() { g_shake -= 3 }, 100);
		// Create particles for explosion effect
		for (let i = 0; i < this.amount; i++) {
			particleSystem.spawnParticle('boom' + particleSystem.particles.length, this.p1, this.pos.x, this.pos.y, 24, 24, this.range, random(-3, 3), random(35, 55), this.dither);
			particleSystem.spawnParticle('boom' + particleSystem.particles.length, this.p2, this.pos.x, this.pos.y, 24, 24, this.range, random(-3, 3), random(25, 35), this.dither);
			particleSystem.spawnParticle('boom' + particleSystem.particles.length, this.p3, this.pos.x, this.pos.y, 24, 24, this.range, random(-3, 3), random(25, 35), this.dither);
		}
		// Check for enemies in range
		for (let i = entityManager.enemies.length-1; i >= 0; i--) {
			let e = entityManager.enemies[i];

			if (inRangeOf(this, e, this.range * 20)) {
				var dx = (e.pos.x) - (this.pos.x),
					dy = (e.pos.y) - (this.pos.y),
					angle = Math.atan2(dx, dy);

				e.health -= this.damage;
				e.vel.x -= Math.sin(angle) * -25;
				e.vel.y -= Math.cos(angle) * -25;
			}
		}
	}
}
