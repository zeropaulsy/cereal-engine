class Explosion extends Entity {
	constructor(x, y, pWidth, pHeight, amount, range, dither, damage, p1, p2, p3) {
		// Set entity properties
		super(null, null, x, y, range * 20, range * 20);
		// Class specific properties
		this.entityType = 'explosion';
		this.pWidth = pWidth;
		this.pHeight = pHeight;
		this.amount = amount;
		this.range = range;
		this.dither = dither;
		this.damage = damage;
		// Set explosion particles
		this.p1 = p1 || p_white;
		this.p2 = p2 || p_orange;
		this.p3 = p3 || p_red_small;
		// Execute explosion
		this.explode();
	}
	spawnParticle(x, y, a, b, spr) {
		let id = 'boomSpr' + particleSystem.particles.length;
		let particle = new Particle(id, spr, x, y, this.pWidth, this.pHeight, this.range, random(-this.range/2, this.range/2), random(a, b), this.dither);
		particleSystem.spawnParticle(particle);
	}
	explode() {
		// Shake screen
		g_shake += 3;
		timerManager.addTimer(function() { g_shake -= 3 }, 100);
		// Create particles for explosion effect
		for (let i = 0; i < this.amount; i++) {
			this.spawnParticle(this.pos.x, this.pos.y, 25, 55, this.p1);
			this.spawnParticle(this.pos.x, this.pos.y, 25, 35, this.p2);
			this.spawnParticle(this.pos.x, this.pos.y, 25, 35, this.p3);
		}
		// Check for enemies in range
		this.handleCollision('bullet', function(e, self) {
			// Calculate distance from center of explosion to entity
			if (e.entityType == 'enemy') {
				e.health -= self.damage;
			}
		});
	}
}
