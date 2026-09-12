// Powerup
class Powerup extends Entity {
	constructor(id, sprite, x, y, width, height, onCollision) {
		// Set Entity properties
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
		// Draw shadow (generated on first use)
		this.drawShadow();
		// Draw powerup sprite
		this.drawSprite(this.sprite, 0);
	}
	destroy() {
		entityManager.removeEntity(this);
	}
	run() {
		this.update();
		this.display();
	}
}
