// CollisionBody Class : CollisionBody(id, parent, x, y, width, height)
class CollisionBody {
	constructor(parent, w, h, col) {
		this.entityType = 'collision_body';
		this.id = parent.id + '_collision_body';
		this.parent = parent;
		this.pos = new Vector(parent.pos.x, parent.pos.y);
		this.w = w;
		this.h = h;
		this.collisionsEnabled = col;
		this.lastCollision = Object();
	}
}
