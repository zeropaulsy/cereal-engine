// Bullet Class : Bullet(id, sprite, parent, width, height)
class Bullet {
	constructor(id, sprite, p, w, h) {
		this.entityType = 'bullet';
		this.id = id;
		this.sprite = sprite;
		this.parent = p;
		this.width = w;
		this.height = h;
		this.hitbox = {w: w, h: h};
		this.speed = p.speed;
		this.dither = p.dither;
		this.damage = p.damage;
		this.hitSound = p.hitSound;
		this.hitParticle = p.hitParticle;
		this.explosive = p.explosive;
		this.angle = p.parent.rotation;
		this.rotation = this.angle + random(-3, 3);
		this.pos = new Vector(
			p.pos.x + (p.parent.width/2.75) * Math.cos(this.angle),
			p.pos.y + (p.parent.width/2.75) * Math.sin(this.angle)
		);
		this.vel = new Vector(
			(Math.cos(this.angle) * p.speed) + random(-p.dither, p.dither),
			(Math.sin(this.angle) * p.speed) + random(-p.dither, p.dither)
		);
		this.health = 1;
		this.lastCollision = Object();
		this.kill = false;
	}
	update() {
		this.pos.add(this.vel);

		if (this.pos.x > width || this.pos.y > height || this.pos.x < 0 || this.pos.y < 0 || this.angle==NaN) this.kill = true;

		this.rotation += (0.25 + delta);

		if (this.health < 0) {
			if (this.explosive)  {
				this.hitSound.play();
				this.explode();
			} else {
				this.hitSound.play();
				particleSystem.spawnParticle('hitmarker' + particleSystem.particles.length, this.hitParticle, this.pos.x, this.pos.y, 18, 18, 3, random(0, 3), 5, 5);
			}
			this.kill = true;
		}
	}
	display() {
		Game.c.save();

		Game.c.translate(this.pos.x, this.pos.y);
		Game.c.rotate(this.rotation);
		Game.c.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);

		Game.c.restore();
	}
	explode() {
		new Explosion(this.pos.x, this.pos.y, 24, 24, 7, 10, 10, 100);
	}
	run() {
		this.update();
		this.display();
	}
}
