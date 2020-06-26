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
		this.kill = false;
	}
	update() {
		if ( inRangeOf(this, player, this.hitbox.w/2) && !this.kill ) {
			this.onCollision();
			this.kill = true;
		}
	}
	display() {
		Game.c.save();
		// Draw Shadow
		Game.c.translate(this.pos.x, this.pos.y + Math.sin(this.rotation)*10);
		Game.c.drawImage(spr_shadow, -this.width/2, (this.height/2)-8, this.width, 16);

		Game.c.restore();

		Game.c.save();

		Game.c.translate(this.pos.x, this.pos.y);
		// Draw sprite
		Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

		Game.c.restore();
	}
	run() {
		this.update();
		this.display();
	}
}
