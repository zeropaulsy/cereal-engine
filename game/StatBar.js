// StatBar Class : HealthBar(id, parent, stat, width, height, container colour, health color)
class StatBar {
	constructor(id, p, statString, w, h, c1, c2) {
		console.log(statString)
		this.id = id;
		this.parent = p;
		this.statString = statString;
		this.stat = this.parent[statString];
		this.pos = new Vector(p.pos.x, p.pos.y);
		this.hWidth = w;
		this.cWidth = w;
		this.height = h;
		this.maxValue = this.parent[this.statString];
		this.ratio = this.parent[this.statString] / w;
		this.cColor = c1;
		this.hColor = c2;
		this.statBar = false;
		this.kill = false;
	}
	update() {
		this.stat = this.parent[this.statString];
		// Constrain width of health within the container
		this.ratio = this.maxValue / this.cWidth;
		this.hWidth = this.stat / this.ratio;
	}
	display(offset_x, offset_y) {
		Game.c.save();
		// Draw container and fill with colour 1
		Game.c.fillStyle = this.cColor;
		Game.c.fillRect(-(this.cWidth / 2) - offset_x, 0 - offset_y, this.cWidth, this.height);
		// Draw stat value and fill with colour 2
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
