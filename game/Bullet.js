// Bullet Class : Bullet(id, sprite, parent, width, height)
class Bullet extends Entity {
	constructor(id, sprite, x, y, width, height, gun) {
		// Set properties from Entity class
		super(id, sprite, x, y, width, height);
		// Class specific properties
		this.entityType = 'bullet';
		this.gun = gun;
		this.speed = gun.speed;
		this.dither = gun.dither;
		this.angle = gun.parent.rotation;
		this.rotation = this.angle + random(-3, 3);
		this.pos = new Vector(
			gun.pos.x + (gun.parent.width / 2.75) * Math.cos(this.angle),
			gun.pos.y + (gun.parent.width / 2.75) * Math.sin(this.angle)
		);
		this.vel = new Vector(
			(Math.cos(this.angle) * gun.speed) + random(-gun.dither, gun.dither),
			(Math.sin(this.angle) * gun.speed) + random(-gun.dither, gun.dither)
		);
		this.damage = gun.damage;
		this.hitSound = gun.hitSound;
		this.explosive = gun.explosive;
		this.health = 1;
		this.knockBack = 0;
		this.friction = 1;
		this.hitbox.type = 1;
	}
	update() {
		this.applyVelocity(this.friction);

		if ( !this.isOnScreen() || this.rotation == NaN) this.destroy();

		this.addRotation( (0.25 * g_speed) * deltaTime );

		if (this.health <= 0) {
			if (!this.explosive)  {
				this.hitSound.play(true);
			}
			this.destroy();
		}
	}
	display() {
		// Draw shadow if generated
		if (this.sprite.shadow) this.drawSprite(this.sprite.shadow, g_shadow_distance);
		// Draw bullet sprite
		this.drawSprite(this.sprite, 0);
	}
	destroy() {
		if (this.explosive) {
			this.explode(audio.mp3_vine_boom, this.gun.p1, this.gun.p2, this.gun.p3);
		} else {
			particleSystem.spawnParticle(new Particle('hitmarker' + particleSystem.particles.length, p_brown_small, this.pos.x, this.pos.y, 10, 10, 3, random(0, 3), 5, 5));
			this.parent.removeEntity(this);
		}
	}
	run() {
		this.update();
		this.display();
	}
}
