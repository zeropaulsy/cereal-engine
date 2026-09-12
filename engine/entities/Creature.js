class Creature extends Entity {
	constructor(id, sprite, x, y, width, height, health, speed, friction) {
		// Call properties from Entity class
		super(id, sprite, x, y, width, height);
		// Class specific properties
		this.entityType = 'creature';
		this.health = health;
		this.maxHealth = health;
		this.speed = speed;
		this.friction = friction || 0.875;
		this.angle = 1;
		this.rotation = 1;
		this.rotationSpeed = 0.75;
		// Create healthbar
		this.healthBar = new StatBar(id + '_health_bar', this, 'health', width / 1.45, height / 12, '#41C1E8', '#65e841');
	}
	setHealth(health) {
		this.health = health;
		this.maxHealth = health;
		this.healthBar.setMaxValue(health);
	}
	setFriction(friction) {
		if (friction > 1 || friction < 0) {
			console.warn('Friction must be between 0 - 1.');
		} else {
			this.friction = friction;
		}
	}
	setSize(width, height) {
		// Call resize function from Entity class
		super.setSize(width, height);
		// Resize player stat bars
		this.healthBar.cWidth = width / 1.45;
		this.dashBar.cWidth = width / 1.45;
		this.healthBar.height = height / 12;
		this.dashBar.height = height / 12;
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
	moveTo(angle, speed, rotationSpeed) {
        this.rotateTo(angle, rotationSpeed);
        this.addVelocity( Math.cos(this.rotation) / speed, Math.sin(this.rotation) / speed );
    }
    rotateTo(angle, rotationSpeed) {
        this.rotation = averageNums(this.rotation, angle, rotationSpeed);
    }
}