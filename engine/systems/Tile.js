// CollisionBody Class
class Tile {
	constructor(id, tilesheet, sx, sy, sw, sh, x, y, width, height, collision, knockBack) {
		this.entityType = 'tile';
		this.id = id;
		this.tilesheet = tilesheet;
		this.spriteX = sx;
		this.spriteY = sy;
		this.spriteWidth = sw;
		this.spriteHeight = sh;
		this.pos = new Vector(x, y);
		this.vel = new Vector(0, 0);
		this.width = width;
		this.height = height;
		this.hitbox = new CollisionBody(this, width, height, true, 1);
		this.collision = collision;
		this.knockBack = knockBack;
		this.kill = false;
	}
	update() {
		if (this.hitbox.collisionsEnabled == true) collisionBetween1(player, this);
	}
	display() {
		Game.c.save();

		//Game.c.translate(this.pos.x, this.pos.y);
		Game.c.drawImage(this.tilesheet, this.spriteX, this.spriteY, 8, 8, this.pos.x-this.width/2, this.pos.y-this.height/2, this.width, this.height);
		//Game.c.fillStyle = 'black';
		//Game.c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
		Game.c.restore();
	}
	run() {
		this.update();
		this.display();
	}
}
