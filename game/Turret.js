// Turret Class
class Turret {
	constructor(id, sprite, target, x, y, width, height, health, ammo, rotationSpeed, stationary) {
		let _this = this;
		this.entityType = 'turret';
		this.id = id;
		this.sprite = sprite;
		this.pos = new Vector(x, y);
		this.vel = new Vector();
		this.width = width;
		this.height = height;
		this.hitbox = {
			w: width,
			h: height
		};
		this.health = health;
		this.maxHealth = health;
		this.ammo = ammo;
		this.target = target;
		this.angle = 0;
		this.rotation = 0;
		this.rotationSpeed = rotationSpeed;
		this.stationary = stationary;
		this.speed = 1;
		this.friction = 0.9;
		this.knockBack = 10;
		this.lastCollision = Object();
		this.kill = false;
		this.inventory = new Inventory(5);
		this.inventory.contents.push(new Gun('staff00', spr_staff_orange, p_orange, this, this.width, this.height, 16, 16, 1, 20, 1, 1, mp3_hitmarker, p_red_small, true));
		this.inventory.contents.push(new Gun('staff01', spr_staff_orange, p_orange, this, this.width, this.height, 16, 16, 1, 10, 2, 0.75, mp3_hitmarker, p_red_small, false));
		this.healthBar = new HealthBar(this.id + '_health_bar', this, 55, 7, '#ce9069', '#51bf59');
		// Add worker thread
		this.worker = new Worker('./game/CalculateAngle.js');
		this.workerUpdateSpeed = 25;
		this.workerTimer = 0;
		// Listen for responce
		this.worker.onmessage = function(e) {
			_this.angle = Math.atan2(e.data.vy, e.data.vx)
		};
	}
	update() {

		this.workerTimer--;
		this.calculateAngle();
		if (isNaN(this.rotation)) this.rotation = 1, console.warn(this.id + ': Could not calculate rotation. Instead set to 1.');

		this.pos.add(this.vel);
		this.vel.multiply(this.friction);

		if (this.health < 0) this.worker.terminate(), this.kill = true;
		// Set flipped variable depending if turret is facing left or right
		if (this.rotation < -1.5 || this.rotation > 1.5) {
			this.flipped = true;
		} else {
			this.flipped = false;
		}
		// Update turret health bar percent
		this.healthBar.update();
		// Manage inventory slots
		if (this.inventory.slotActive == 0) this.inventory.equipItem('staff00');
		if (this.inventory.slotActive == 1) this.inventory.equipItem('staff01');
	}
	display() {

		Game.c.save();
		// Draw Shadow
		Game.c.translate(this.pos.x, this.pos.y + Math.sin(this.rotation) * 10);
		Game.c.drawImage(spr_shadow, -this.width / 2, (this.height / 2) - 8, this.width, 16);

		Game.c.restore();

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
		// Render player sprite
		Game.c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
		// Run health bar and inventory within the save restore to inherit player position and rotation
		this.healthBar.display(0, this.height / 1.5);

		this.inventory.run();

		Game.c.restore();
	}
	calculateAngle() {
		if (0 < entityManager.enemies.length) {

			for (var target, d = Number.MAX_VALUE, i = 0; i < entityManager.enemies.length; i++) {
				let enemy 	 = entityManager.enemies[i],
						distance = Math.pow(this.pos.x - enemy.pos.x, 2) + Math.pow(this.pos.y - enemy.pos.y, 2);
				distance < d && (target = enemy, d = distance)
			}

			let t = target;

			// Current weapon projectile speed
			// this.vMag = this.inventory.getEquippedItem().speed;

			// Send to worker thread
			if (this.workerTimer < 0) {
				this.worker.postMessage({
					'worker_message': 'calculate_angle',
					'turret': {
						x: this.pos.x,
						y: this.pos.y
					},
					'target': {
						x: t.pos.x,
						y: t.pos.y
					},
					'targetVel': {
						x: t.vel.x,
						y: t.vel.y
					},
					'vMag': this.inventory.getEquippedItem().speed
				});
				// Reset worker timer
				this.workerTimer = this.workerUpdateSpeed;
			}

			this.rotation = averageNums(this.rotation, this.angle, this.rotationSpeed);

			if (!this.stationary && !inRangeOf(this, player, 256)) {

				let tx = ((player.pos.x - player.width) - this.pos.x);
				let ty = ((player.pos.y - player.width) - this.pos.y);
				let ta = Math.atan2(ty, tx);

				this.vel.x += Math.cos(ta) / this.speed;
				this.vel.y += Math.sin(ta) / this.speed;

			}

			this.inventory.getEquippedItem().shoot();

		} else {
			this.angle = 0.5;
			this.rotation = averageNums(this.rotation, this.angle, this.rotationSpeed);
		}
	}
	run() {
		this.update()
		this.display();
	}
}
