// Enemy Class : Enemy(id, sprite, target, x, y, width, height, speed, health, death sound, score value)
class Enemy extends Creature {
	constructor(id, sprite, x, y, width, height, target, health, speed, friction, showHealthBar, deathSound, scoreValue) {
		// Set properties from Creature class
		super(id, sprite, x, y, width, height, health, speed, friction);
		// Set class specific properties
		this.entityType = 'enemy';
		this.target = target;
		this.showHealthBar = false;
		this.deathSound = deathSound;
		this.scoreValue = scoreValue;
		this.sprite_dmg_1;
		this.sprite_dmg_2;
		this.sprite_dmg_enabled = false;
		this.rotationSpeed = random(0.875, 0.95);
		this.faceTarget = false;
		this.explosive = false;
		this.hitmarker = p_hitmarker;
		this.path = [];
		this.pathInstanceId = 'none';
		this.pathfinding = false;
	}
	update() {
		// Find player and follow path
		if (this.isOnGrid() && g_pathfinding_enabled) {
			findEntityPath(this, this.target);
		}
		if (this.pathfinding && g_pathfinding_enabled) {
			try {
				this.dx = ( (this.path[1].x - random(-1, 1) ) * g_tileSize ) - ( this.pos.x - (this.width / 2) );
				this.dy = ( (this.path[1].y - random(-1, 1) ) * g_tileSize ) - ( this.pos.y - (this.height/ 2) );
				this.rotateTo(Math.atan2(this.dy, this.dx), this.rotationSpeed);
			}
			catch {
				this.rotateTo(this.pos.angle(this.target.pos), this.rotationSpeed);
			}
		} else {
			this.rotateTo(this.pos.angle(this.target.pos), this.rotationSpeed);
		}
		// Set velocity to move in direction of angle
		this.moveTo(this.pos.angle(this.target.pos), this.speed, this.rotationSpeed);
		this.applyVelocity(this.friction);
		// Collision between entities excluding player, collisions with player handled in player class
		this.handleCollision('player', function(e, self) {
			if (e.entityType == 'bullet') {
				self.spawnHitmarker(e.pos.x, e.pos.y, false);
				e.health = 0;
				self.health -= e.damage;
			}
		});
		// Change sprite depending on health
		if (this.sprite_dmg_enabled) {
			if (this.health < this.maxHealth * 0.66) this.sprite = this.sprite_dmg_1;
			if (this.health < this.maxHealth * 0.33) this.sprite = this.sprite_dmg_2;
		}
		if (this.showHealthBar) this.healthBar.update();
		// Set entity to be destroyed when health runs out
		if (this.health < 0 || isNaN(this.health)) {
			Game.getCurrentState().score += this.scoreValue;
			this.destroy();
		}
	}
	display() {
		// Draw shadow if generated
		if (this.sprite.shadow) this.drawSprite(this.sprite.shadow, g_shadow_distance);
		// Draw sprite and healthbar
		this.drawSprite(this.sprite, 0, function() {
			// Display healthbar if enabled
			if (this.showHealthBar) this.healthBar.display(0, this.height/2 + 15);
			// Flip x-axis only if facetarget is enabled
			if (this.faceTarget) {
				if (this.rotation < -1.5 || this.rotation > 1.5) {
                   	this.setSpriteScale(-1, 1);
                } else {
                   	this.setSpriteScale( 1, 1);
                }
			}
		});
	}
	spawnHitmarker(x, y) {
		let id = 'hitmarker' + particleSystem.particles.length;
		let particle = new Particle(id, this.hitmarker, x, y, 24, 24, 3, random(0, 3), 10, 5);
		particleSystem.spawnParticle(particle);
	}
	spawnDeathParticle(x, y) {
		let id = 'death_particle' + particleSystem.particles.length;
		let particle = new Particle(id, p_plus_1, this.pos.x, this.pos.y, 16, 16, 10, -1.5, 30, 5);
		particleSystem.spawnParticle(particle);
	}
	destroy() {
		// Play death noise
		this.deathSound.play();
		// Spawn blood particles
		this.spawnDeathParticle(this.pos.x, this.pos.y, false);
		// Drop powerup
		if (random(0, 100) < g_powerup_drop_rate && !this.powerupDropped) {
			Game.getCurrentState().dropPowerup(this);
			this.powerupDropped = true;
		}
		// Cancel easystar pathfinding
		easystar.cancelPath(this.pathInstanceId);
		// Explode if explosive enemy
		if (this.explosive) {
			// Play sound
			audio.mp3_tnt.play(0, 0, true);
			// Create explosion
			new Explosion(this.pos.x, this.pos.y, 64, 64, 20, this.width/8, 10, this.width/8, gif_tnt_exp, p_dust, p_smoke);
		}
		// Destroy entity
		this.parent.removeEntity(this);
	}
	run() {
		this.update();
		this.display();
	}
}
