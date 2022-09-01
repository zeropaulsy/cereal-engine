// Turret Class
class Turret extends Creature {
	constructor(id, sprite, target, x, y, width, height, health, speed, ammo) {
		// Set Creature properties
		super(id, sprite, x, y, width, height, health, speed);
		// Class specific properties
		let self = this;
		this.entityType = 'turret';
		this.target = target;
		this.ammo = ammo;
		this.angle = 0.5;
		this.rotationSpeed = 0.75;
		this.stationary = false;
		this.distance = random(128, 256);
		// Worker message timings
		this.worker = Game.getCurrentState().turretWorker;
		this.workerUpdateSpeed = 25;
		this.workerTimer = 0;
		// Listen for worker responce message
		this.worker.onmessage = function(e) {
			self.angle = Math.atan2(e.data.vy, e.data.vx);
		};
	}
	update() {
		this.applyVelocity(this.friction);
		this.constrainToScreen();

		if ( !this.stationary && !this.inRangeOf(player, this.distance) ) {

			let tx = ( (player.pos.x - player.width) - this.pos.x );
			let ty = ( (player.pos.y - player.width) - this.pos.y );
			let ta = Math.atan2(ty, tx);

			this.vel.x += Math.cos(ta) / this.speed;
			this.vel.y += Math.sin(ta) / this.speed;

		}
		if (this.inventory) {
			this.workerTimer -= g_speed * deltaTime;
			this.calculateAngle();
		}
		if ( isNaN(this.rotation) ) this.rotation = 1, console.warn(this.id + ': Could not calculate rotation. Instead set to 1.');

		if (this.health < 0) this.destroy(10);
		// Set flipped variable depending if turret is facing left or right
		if (this.rotation < -1.5 || this.rotation > 1.5) {
			this.flipped = true;
		} else {
			this.flipped = false;
		}
		// Update turret health bar percent
		this.healthBar.update();
	}
	display() {
		// Draw shadow if generated
		if (this.sprite.shadow) this.drawSprite(this.sprite.shadow, g_shadow_distance);
		// Draw player sprite
		this.drawSprite(this.sprite, 0, function() {
			// Run health bar and inventory within the save restore to inherit player position and rotation
			this.healthBar.display(0, this.height / 1.5);
			// Run inventory and render ontop of the player
			this.inventory.run();
		});
	}
	findTarget() {
		// Find closest enemy
		for (var target, d = Number.MAX_VALUE, i = 0; i < this.parent.entities.length; i++) {
			let e = this.parent.entities[i];
			if (e.entityType !== this.target) {
            	continue;
            }
			let distance = Math.pow(this.pos.x - e.pos.x, 2) + Math.pow(this.pos.y - e.pos.y, 2);
			distance < d && (target = e, d = distance)
		}
		return target;
	}
	workerMessage() {
		// Set target
		let t = this.findTarget();
		// Write message
		if (t.pos) {
			return {
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
			}
		}
	}
	calculateAngle() {
		// Send data to worker thread
		if (this.workerTimer < 0) {
			// Post message to worker thread
			this.worker.postMessage( this.workerMessage() );
			// Reset worker timer
			this.workerTimer = this.workerUpdateSpeed;
		}
		// Rotate towards target
		this.rotateTo(this.angle, this.rotationSpeed);
		// Fire equipped weapon
		this.inventory.getEquippedItem().shoot();
	}
	destroy(a) {
		let amount = a || 0
		// Spawn death particles
		for (let i = 0; i < amount; i++) {
			particleSystem.spawnParticle('hitmarker' + particleSystem.particles.length, p_red_small , this.pos.x, this.pos.y, 18, 18, 3, random(0, 3), 15, 5);
		}
		// Remove entity from main array
		this.explode(audio.mp3_vine_boom, p_explosion, spr_dew_logo, p_hitmarker);
		// this.parent.removeEntity(this);
	}
	run() {
		this.update()
		this.display();
	}
}
