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
		if (g_shadows_enabled) {
			Game.c.save();
			// Draw Shadow
			Game.c.translate(this.pos.x, this.pos.y);
			Game.c.drawImage(spr_shadow, -this.width/2, this.height/2, this.width, 16);

			Game.c.restore();
		}
		Game.c.save();

		Game.c.translate(this.pos.x, this.pos.y + Math.round(Math.sin(lastCalledTime/250)));
		Game.c.rotate(this.rotation);
		if (this.sprite.shadow) {
			Game.c.drawImage(this.sprite.shadow, -this.width / 2 + g_shadow_distance, -this.height / 2 + g_shadow_distance, this.width, this.height);
		}
		// Draw sprite
		Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

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
