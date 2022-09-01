class Player extends Creature {
	constructor(id, sprite, x, y, width, height, health, speed) {
		// Set properties from Entity class
		super(id, sprite, x, y, width, height, health, speed);
		// Set class specific properties
		this.entityType = 'player';
		this.dashVel = 5;
		this.dashing = false;
		this.dashMaxCharge = 1500;
		this.dashCharge = this.dashMaxCharge;
		this.powerupActive = false;
		// Create a dash bar for the player
		this.dashBar = new StatBar('player_dash_bar', this, 'dashCharge', width / 1.45, height / 12, '#41C1E8', '#E85D41');
	}
	update() {
		this.applyVelocity(this.friction);
		// Bind movement listeners to player velocity
		if (upPressed	) this.moveUp();
		if (downPressed	) this.moveDown();
		if (leftPressed	) this.moveLeft();
		if (rightPressed) this.moveRight();
		// Handle weapon shooting
		for (let i = 0; i < this.inventory.contents.length; i++) {
			let g = this.inventory.contents[i];
			if (g.equipped && mouseDown) g.shoot();
		}
		// Recharge dash bar
		if (this.dashCharge < this.dashMaxCharge) {
			this.dashCharge += 10;
		}
		// Handle controller movement
		if (g_gamepadConnected && g_lastInput == 'controller') {
			// Move in direct of left joystick
			moveTo(leftJoystick, this.speed, 0.35);
			// Shoot when aiming with right joystick
			if (rightJoystick.x != 0 || rightJoystick.y != 0) {
				this.inventory.getEquippedItem().shoot(this.inventory.getEquippedItem().amount);
				this.rotateTo(rightJoystick, this.rotationSpeed);
			} else {
				this.rotateTo(1, this.rotationSpeed);
			}
		} else {
			// Rotate to mouse position
			this.rotateTo(this.pos.angle(canvas.mouse), 0.35);
		}
		// Handle collision with all entities excluding bullets
		this.handleCollision('bullet', function(e, self) {
			if (e.entityType == 'enemy') {
				self.health -= 1;
				audio.mp3_hurt.play(0, 0.1, false);
			}
		});
		// Constrain player to screen
		this.constrainToScreen();
		// Update player health bar and dashbar
		this.healthBar.update();
		this.dashBar.update();
	}
	display() {
		// Draw shadow if generated
		if (this.sprite.shadow) this.drawSprite(this.sprite.shadow, g_shadow_distance);
		// Draw player sprite
		this.drawSprite(this.sprite, 0, function() {
			// Run health bar and inventory within the save restore to inherit player position and rotation
			this.healthBar.display(0, this.height / 1.5);
			this.dashBar.display(0, this.height / 1.25);
			// Run inventory and render ontop of the player
			this.inventory.run();
		});
	}
	dash(vel, callback) {
		if (this.dashCharge == this.dashMaxCharge) {
			// Drain dash charge
			this.dashCharge = 0;
			// Add vel to player velocity
			this.vel.multiply(vel);
			// Scripted dash event
			callback();
		}
	}
	run() {
		this.update();
		this.display();
	}
}
