// CollisionBody Class : CollisionBody(id, parent, x, y, width, height)
class CollisionBody {
	constructor(parent, w, h, col, type) {
		this.entityType = 'collision_body';
		this.id = parent.id + '_collision_body';
		this.parent = parent;
		this.pos = new Vector(parent.pos.x, parent.pos.y);
		this.w = w;
		this.h = h;
		this.collisionsEnabled = col;
		this.type = type || 2;
		this.lastCollision = Object();
	}
}
