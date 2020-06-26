// Gun Class : Gun(id, gun sprite, bullet sprite, parent, width, height, amount, speed, dither, damage, hit sound, hit particle, eqipped)
class Gun {
	constructor(id, sprite, bulletSprite, parent, width, height, bulletWidth, bulletHeight, amount, speed, dither, damage, hitSound, hitParticle, equipped) {
		this.id = id;
		this.sprite = sprite;
		this.bulletSprite = bulletSprite;
		this.parent = parent;
		this.pos = new Vector(parent.pos.x, parent.pos.y);
		this.width = width;
		this.height = height;
		this.bulletWidth = bulletWidth;
		this.bulletHeight = bulletHeight;
		this.amount = amount;
		this.speed = speed;
		this.dither = dither;
		this.damage = damage;
		this.hitSound = hitSound;
		this.hitParticle = hitParticle;
		this.equipped = equipped;
		this.firerate = 0.01;
		this.explosive = false;
		this.timeCounter = 0;
		this.angle = parent.angle;
		this.flipped = false;
	}
	update() {
		// Set position to parent position
		this.pos.equals(this.parent.pos);
		// Count time passed
		this.timeCounter += delta;
		// Spawn bullet when equipped and mouse is pressed
		if (this.equipped && mouseDown && !g_paused) {
			if (this.timeCounter > this.firerate) {
				this.timeCounter = 0;
				this.shoot(this.amount);
			}
		}
		this.angle = this.parent.angle;
	}
	display() {
		if (this.equipped) Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
	}
	shoot() {
		for (let i = 0; i < this.amount; i++) {
			entityManager.spawnBullet(
				'bullet' + entityManager.bullets.length,
				this.bulletSprite,
				this,
				this.bulletWidth,
				this.bulletHeight
			);
		}
	}
	run() {
		this.update();
		this.display();
	}
}
