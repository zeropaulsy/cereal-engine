// Powerup
class Powerup {
	constructor(id, sprite, x, y, width, height, onCollision) {
		this.entityType = 'powerup';
		this.id = id;
		this.sprite = sprite;
		this.pos = new Vector(x, y);
		this.width = width;
		this.height = height;
		this.hitbox = {w: width, h: height};
		this.onCollision = onCollision;
		this.lastCollision = Object();
		this.health = random(500, 750);
		this.kill = false;
	}
	update() {
		if ( inRangeOf(this, player, this.hitbox.w/2) && !this.kill ) {
			if (this.onCollision()) this.kill = true;
		}
		this.health--;
		if (this.health < 0) this.kill = true;
	}
	display() {
		Game.c.save();
		// Draw Shadow
		Game.c.translate(this.pos.x, this.pos.y);
		Game.c.drawImage(spr_shadow, -this.width/2, this.height/2, this.width, 16);

		Game.c.restore();

		Game.c.save();

		Game.c.translate(this.pos.x, this.pos.y + Math.round(Math.sin(lastCalledTime/250)));
		// Draw sprite
		Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

		Game.c.restore();
	}
	run() {
		this.update();
		this.display();
	}
}
