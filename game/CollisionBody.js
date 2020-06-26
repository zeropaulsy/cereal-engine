// CollisionBody Class : CollisionBody(id, parent, x, y, width, height)
class CollisionBody {
	constructor(id, parent, x, y, width, height, col) {
		this.entityType = 'collision_body';
		this.id = id;
		this.parent = parent;
		this.pos = new Vector(x, y);
		this.hitbox = {w: width, h: height};
		this.collisionsEnabled = col;
		this.lastCollision = Object();
	}
}
