// Player Class : Player(id, sprite, x, y, width, height, speed, friction, knockback)
class Player {
	constructor(id, sprite, x, y, w, h, s, f, k) {
		this.entityType = 'player';
		this.id = id;
		this.showId = false;
		this.sprite = sprite;
		this.pos = new Vector(x, y);
		this.vel = new Vector(0, 0);
		this.tile = new Vector();
		this.width = w;
		this.height = h;
		this.hitbox = new CollisionBody(this, w, h, true, 1);
		this.speed = s;
		this.friction = f;
		this.knockBack = k;
		this.health = 100;
		this.maxHealth = 100;
		this.angle = 1;
		this.rotation = 1;
		this.rotationSpeed = 0.75;
		this.dashVel = 5;
		this.dashing = false;
		this.dashMaxCharge = 1500;
		this.dashCharge = this.dashMaxCharge;
		this.powerupActive = false;
		// Create player inventory to store weapons
		this.inventory = new Inventory(10);
		// Create a health bar for the player
		this.healthBar = new StatBar('player_health_bar', this, 'health', w / 1.45, h / 12, '#41C1E8', '#E85D41');
		this.dashBar = new StatBar('player_dash_bar', this, 'dashCharge', w / 1.45, h / 12, '#41C1E8', '#65e841');
	}
	update() {
		this.pos.add(this.vel);
		this.vel.dampen(this.friction);

		if (this.friction > 1) this.friction = 1;
		// Calculate tile player is on
		this.tile.x = Math.floor( this.pos.x / g_tileSize ) * g_tileSize;
		this.tile.y = Math.floor( this.pos.y / g_tileSize ) * g_tileSize;
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
			// Add joystick pos to player velocity
			this.vel.x += leftJoystick.x;
			this.vel.y += leftJoystick.y;
			// Shoot when aiming with right joystick
			if (rightJoystick.x != 0 || rightJoystick.y != 0) {
				this.inventory.getEquippedItem().shoot(this.inventory.getEquippedItem().amount);
				this.angle = Math.atan2(rightJoystick.y, rightJoystick.x);
				this.rotation = averageNums(this.rotation, this.angle, this.rotationSpeed);
			} else {
				this.angle = 1;
			}
		} else {
			// Calculate player angle in relation to mouse
			this.dx = canvas.mouseX - (this.pos.x);
			this.dy = canvas.mouseY - (this.pos.y);
			this.angle = Math.atan2(this.dy, this.dx);
			this.rotation = averageNums(this.rotation, this.angle, 0.35);
		}
		// Constrain player to screen
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
		// Set flipped variable depending if player is facing left or right
		if (this.rotation < -1.5 || this.rotation > 1.5) {
			this.flipped = true;
		} else {
			this.flipped = false;
		}
		// Update player health bar percent
		this.healthBar.update();
		this.dashBar.update();
	}
	display() {
		if (g_shadows_enabled) {
			Game.c.save();
			// Draw Shadow
			Game.c.translate(this.pos.x, this.pos.y + Math.sin(this.rotation)*10);
			Game.c.drawImage(spr_shadow, -this.width/2, (this.height/2)-8, this.width, 16);

			Game.c.restore();
		}
		// Render Shadow
		Game.c.save();
		// Flip sprite on Y axis when updside down
		if (this.flipped) {
			Game.c.scale(1, -1);
			Game.c.translate(this.pos.x + g_shadow_distance, -this.pos.y - g_shadow_distance);
			Game.c.rotate(-this.rotation);
		} else {
			Game.c.scale(1, 1);
			Game.c.translate(this.pos.x + g_shadow_distance, this.pos.y + g_shadow_distance);
			Game.c.rotate(this.rotation);
		}
		// Draw player shadow
		if (this.sprite.shadow) {
			Game.c.drawImage(this.sprite.shadow, -this.width / 2, -this.height / 2, this.width, this.height);
		}

		Game.c.restore();
		// Render player
		Game.c.save();
		// Flip sprite on Y axis when updside down
		if (this.flipped) {
			Game.c.scale(1, -1);
			Game.c.translate(this.pos.x, -this.pos.y);
			Game.c.rotate(-this.rotation);
		} else {
			Game.c.scale(1, 1);
			Game.c.translate(this.pos.x, this.pos.y);
			Game.c.rotate(this.rotation);
		}
		// Run health bar and inventory within the save restore to inherit player position and rotation
		this.healthBar.display(0, this.height / 1.5);
		this.dashBar.display(0, this.height / 1.25);
		// Draw player sprite
		Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
		// Run inventory and render ontop of the player
		this.inventory.run();

		Game.c.restore();
	}
	resize(width, height) {
		this.width = width;
		this.height = height;
		this.hitbox.w = width;
		this.hitbox.h = height;
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
