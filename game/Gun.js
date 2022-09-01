// Gun Class : Gun(id, gun sprite, bullet sprite, parent, width, height, amount, speed, dither, damage, hit sound, hit particle, eqipped)
class Gun {
	constructor(id, sprite, bulletSprite, parent, bulletWidth, bulletHeight, amount, speed, dither, damage, hitSound, hitParticle, equipped) {
		let self = this;
		this.id = id;
		this.sprite = sprite;
		this.bulletSprite = bulletSprite;
		this.parent = parent;
		this.pos = new Vector(parent.pos.x, parent.pos.y);
		this.width = parent.width;
		this.height = parent.height;
		this.bulletWidth = bulletWidth;
		this.bulletHeight = bulletHeight;
		this.amount = amount;
		this.speed = speed;
		this.dither = dither;
		this.damage = damage;
		this.hitSound = hitSound;
		this.hitParticle = hitParticle;
		this.equipped = equipped;
		this.firerate = 2;
		this.explosive = false;
		this.timeCounter = 0;
		this.angle = parent.angle;
		this.flipped = false;
		// Define explosive particles to pass onto bullet
		this.p1 = p_white;
		this.p2 = p_orange;
		this.p3 = p_red_small;
		// Function to call as the weapon is equipped / holstered
		this.onEquip   = function() {};
		this.onHolster = function() {};
	}
	update() {
		// Set position to parent position
		this.pos.equals(this.parent.pos);
		// Count time passed
		this.timeCounter += g_speed * deltaTime;

		this.angle = this.parent.angle;

		this.width = this.parent.width;
		this.height = this.parent.height;
	}
	display() {
		if (this.equipped) Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
	}
	shoot() {
		if (this.timeCounter >= this.firerate) {
			for (let i = 0; i < this.amount; i++) {
				entityManager.spawnEntity(new Bullet('bullet' + entityManager.entities.length, this.bulletSprite, this.pos.x, this.pos.y, this.bulletWidth, this.bulletHeight, this));
			}
			this.timeCounter = 0;
		}
	}
	run() {
		this.update();
		this.display();
	}
}
