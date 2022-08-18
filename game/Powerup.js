// Powerup
class Powerup extends Entity {
	constructor(id, sprite, x, y, width, height, onCollision) {
		// Call Entity properties
		super(id, sprite, x, y, width, height);
		// Class specific properties
		this.entityType = 'powerup';
		this.onCollision = onCollision;
		this.health = random(500, 750);
	}
	update() {
		if ( inRangeOf(this, player, this.hitbox.w/2) ) {
			if (this.onCollision()) {
				audio.mp3_pop.play(0, 0.2, true);
				this.destroy();
			}
		}
		this.health--;
		if (this.health < 0) this.destroy();
	}
	display() {
		Game.c.save();
		// Move entity to position and rotation
		Game.c.translate(this.pos.x, this.pos.y + Math.round(Math.sin(lastCalledTime/250)));
		Game.c.rotate(this.rotation);
		// Draw drop shadow behind sprite
		this.drawShadow();
		// Draw sprite
		this.drawSprite();

		Game.c.restore();
	}
	destroy() {
		entityManager.removeEntity(this);
	}
	run() {
		this.update();
		this.display();
	}
}
