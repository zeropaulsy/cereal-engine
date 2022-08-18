// Entity Class
class Entity {
	constructor(id, sprite, x, y, width, height) {
		this.id 	   = id;
		this.showId    = false;
		this.sprite    = sprite;
		this.pos 	   = new Vector(x, y);
		this.vel 	   = new Vector(0, 0);
		this.tile 	   = new Vector();
		this.width 	   = width;
		this.height    = height;
		this.hitbox    = new CollisionBody(this, width, height, true, 2);
		this.parent    = entityManager;
		this.knockBack = 15;
		this.friction  = 0.875;
		this.speed 	   = 1;
		this.rotation  = 0;
	}
	// Extra
	explode(audio, p1, p2, p3) {
		// Play sound
		audio.play(0, 0.25, true);
		// Create explosion
		new Explosion(this.pos.x, this.pos.y, 24, 24, 7, 10, 10, 100, p1, p2, p3);
		// Destroy entity
		this.parent.removeEntity(this);
	}
	// Position
	getPosition() {
		return {
			x: this.pos.x, 
			y: this.pos.y
		}
	}
	setPosition(x, y) {
		this.pos.x = x;
		this.pos.y = y;
	}
	constrainToScreen() {
		if (this.pos.x < this.width/2) {
			this.vel.x = 0;
			this.pos.x = this.width/2;
		}
		if (this.pos.x > width - this.width/2) {
			this.vel.x = 0;
			this.pos.x = width - this.width/2;
		}
		if (this.pos.y < this.height/2) {
			this.vel.y = 0;
			this.pos.y = this.height/2;
		}
		if (this.pos.y > height - this.height/2) {
			this.vel.y = 0;
			this.pos.y = height - this.height/2;
		}
	}
	// Velocity
	getVelocity() {
		return {
			x: this.vel.x, 
			y: this.vel.y
		}
	}
	setVelocity(x, y) {
		this.vel.x = x;
		this.vel.y = y;
	}
	addVelocity(x, y) {
		this.vel.x += x;
		this.vel.y += y;
	}
	applyVelocity() {
		this.pos.add(this.vel);
		this.vel.dampen(this.friction);
	}
	moveUp() {
		if (this.vel.y > -this.speed) this.vel.y--;
	}
	moveDown() {
		if (this.vel.y <  this.speed) this.vel.y++;
	}
	moveLeft() {
		if (this.vel.x > -this.speed) this.vel.x--;
	}
	moveRight() {
		if (this.vel.x <  this.speed) this.vel.x++;
	}
	// Rotation
	getRotation() {
		return this.rotation;
	}
	setRotation(rotation) {
		this.rotation = rotation;
	}
	addRotation(rotation) {
		this.rotation += rotation;
	}
	// Size
	getSize() {
		return {
			width : this.width,
			height: this.height
		}
	}
	setSize(width, height) {
		this.width    = width;
		this.height   = height;
		this.hitbox.w = width;
		this.hitbox.h = height;
	}
}