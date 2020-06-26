// HealthBar Class : HealthBar(id, parent, width, height, container colour, health color)
class HealthBar {
	constructor(id, p, w, h, c1, c2) {
		this.id = id;
		this.parent = p;
		this.pos = new Vector(p.pos.x, p.pos.y);
		this.hWidth = w;
		this.cWidth = w;
		this.height = h;
		this.ratio = p.maxHealth / w;
		this.cColor = c1;
		this.hColor = c2;
		this.kill = false;
	}
	update() {
		// Constrain width of health within the container
		this.ratio = this.parent.maxHealth / this.cWidth;
		this.hWidth = this.parent.health / this.ratio;
	}
	display(offset_x, offset_y) {
		Game.c.save();
		// Draw health container and fill with colour 1
		Game.c.fillStyle = this.cColor;
		Game.c.fillRect(-(this.cWidth / 2) - offset_x, 0 - offset_y, this.cWidth, this.height);
		// Draw health and fill with colour 2
		Game.c.fillStyle = this.hColor; 
		Game.c.translate(-2, -2);
		Game.c.fillRect(-(this.cWidth / 2) - offset_x, 0 - offset_y, this.hWidth + 2, this.height + 2);

		Game.c.restore();
	}
	run() {
		this.update();
		this.display();
	}
}