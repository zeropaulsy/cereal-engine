// Bullet Class : Bullet(id, sprite, parent, width, height)
class Bullet extends Entity {
	constructor(id, sprite, x, y, width, height, p) {
		// Call properties from Entity class
		super(id, sprite, x, y, width, height);
		// Class specific properties
		this.entityType = 'bullet';
		this.parent = p;
		this.speed = p.speed;
		this.dither = p.dither;
		this.angle = p.parent.rotation;
		this.rotation = this.angle + random(-3, 3);
		this.pos = new Vector(
			p.pos.x + (p.parent.width / 2.75) * Math.cos(this.angle),
			p.pos.y + (p.parent.width / 2.75) * Math.sin(this.angle)
		);
		this.vel = new Vector(
			(Math.cos(this.angle) * p.speed) + random(-p.dither, p.dither),
			(Math.sin(this.angle) * p.speed) + random(-p.dither, p.dither)
		);
		this.damage = p.damage;
		this.hitSound = p.hitSound;
		this.hitParticle = p.hitParticle;
		this.explosive = p.explosive;
		this.health = 1;
		this.knockBack = 0;
		this.friction = 1;
		this.hitbox.type = 1;
	}
	update() {
		this.applyVelocity();

		if (this.pos.x > width || this.pos.y > height || this.pos.x < 0 || this.pos.y < 0 || this.angle==NaN) this.destroy();

		this.addRotation( (0.25 * g_speed) * deltaTime );

		if (this.health <= 0) {
			if (!this.explosive)  {
				this.hitSound.play(true);
			}
			this.hitmarker();
			this.destroy();
		}
	}
	display() {
		// Shadow
		Game.c.save();

		Game.c.translate(this.pos.x + g_shadow_distance, this.pos.y + g_shadow_distance);
		Game.c.rotate(this.rotation);
		this.drawShadow();

		Game.c.restore();

		// Bullet
		Game.c.save();

		Game.c.translate(this.pos.x, this.pos.y);
		Game.c.rotate(this.rotation);
		this.drawSprite();

		Game.c.restore();
	}
	hitmarker() {
		particleSystem.spawnParticle('hitmarker' + particleSystem.particles.length, this.hitParticle, this.pos.x, this.pos.y, 24, 24, 3, random(0, 3), 10, 5);
	}
	explode() {
		audio.mp3_vine_boom.play(0, 0.25, true);
		new Explosion(this.pos.x, this.pos.y, 24, 24, 7, 10, 10, 100, this.parent.p1, this.parent.p2, this.parent.p3);
	}
	destroy() {
		if (this.explosive) this.explode();
		particleSystem.spawnParticle('hitmarker' + particleSystem.particles.length, p_brown_small, this.pos.x, this.pos.y, 10, 10, 3, random(0, 3), 5, 5);

		entityManager.removeEntity(this);
	}
	run() {
		this.update();
		this.display();
	}
}
