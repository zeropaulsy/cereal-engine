// Enemy Class : Enemy(id, sprite, target, x, y, width, height, speed, health, death sound, score value)
class Enemy {
	constructor(id, sprite, target, x, y, width, height, showHealthBar, speed, health, deathSound, scoreValue, powerupSprite) {
		this.entityType = 'enemy';
		this.id = id;
		this.showId = false;
		this.parent = entityManager;
		this.sprite = sprite;
		this.sprite_dmg_1;
		this.sprite_dmg_2;
		this.sprite_dmg_enabled = false;
		this.target = target;
		this.faceTarget = true;
		this.pos = new Vector(x, y);
		this.vel = new Vector();
		this.tile = new Vector();
		this.width = width;
		this.height = height;
		this.hitbox = new CollisionBody(this, width, height, true, 2);
		this.speed = speed;
		this.health = health;
		this.maxHealth = health;
		this.showHealthBar = showHealthBar;
		this.healthBar = new StatBar(id + '_healthbar', this, 'health', width / 1.5, 7, '#f0f0dd', '#686e46');
		this.deathSound = deathSound;
		this.scoreValue = scoreValue;
		this.powerupSprite = powerupSprite || spr_box;
		this.knockBack = 0;
		this.angle = 1;
		this.rotation = this.pos.angle(target.pos);
		this.rotationSpeed = random(0.875, 0.95);
		this.flipped = false;
		this.kill = false;
		this.path = [];
		this.pathInstanceId = 'none';
		this.pathfinding = false;
		this.powerupDropped = false;
	}
	update() {
		this.pos.add(this.vel);
		this.vel.multiply(0.875);
		this.tile.x = Math.floor(this.pos.x/g_tileSize)*g_tileSize;
		this.tile.y = Math.floor(this.pos.y/g_tileSize)*g_tileSize;
		// Find player and follow path
		if (this.isOnGrid() && g_pathfinding_enabled) {
			findEntityPath(this, this.target);
		}
		if (this.pathfinding && g_pathfinding_enabled) {
			try {
				this.dx = ( (this.path[1].x - random(-1, 1) ) * g_tileSize ) - ( this.pos.x - (this.width / 2) );
				this.dy = ( (this.path[1].y - random(-1, 1) ) * g_tileSize ) - ( this.pos.y - (this.height/ 2) );
				this.angle = Math.atan2(this.dy, this.dx);
			}
			catch {
				this.angle = this.pos.angle(this.target.pos);
			}
		} else {
			this.angle = this.pos.angle(this.target.pos);
		}
		this.rotation = averageNums(this.rotation, this.angle, this.rotationSpeed);
		// Set velocity to move in direction of angle
		this.vel.x += Math.cos(this.rotation) / this.speed;
		this.vel.y += Math.sin(this.rotation) / this.speed;
		// Collision between player
		if (collisionBetween1(this, player) && player.health > 1) {
			player.health -= 1;
			audio.mp3_hurt.play(0, 0.1, false);
		}
		// Change sprite depending on health
		if (this.sprite_dmg_enabled) {
			if (this.health < this.maxHealth * 0.66) this.sprite = this.sprite_dmg_1;
			if (this.health < this.maxHealth * 0.33) this.sprite = this.sprite_dmg_2;
		}
		// Flip the sprite depending on the angle it is facing
		if (this.rotation < -1.5 || this.rotation > 1.5) {
			this.flipped = false;
		} else {
			this.flipped = true;
		}
		if (this.showHealthBar) this.healthBar.update();
		// Set entity to be destroyed when health runs out
		if (this.health < 0 || isNaN(this.health)) {
			Game.getCurrentState().score += this.scoreValue;
			this.destroy();
		}
	}
	display() {
		// Draw tile enemy is on
		// Game.c.fillStyle = 'rgba(255, 0, 0, 0.5)';
		// Game.c.fillRect(this.tile.x, this.tile.y, g_tileSize, g_tileSize);

		Game.c.save();
		// Flip sprite if upside down
		if (this.flipped && this.faceTarget) {
			Game.c.scale(-1, 1);
			Game.c.translate(-this.pos.x, this.pos.y);
			//Game.c.rotate(-this.rotation);
		} else {
			Game.c.scale(1, 1);
			Game.c.translate(this.pos.x, this.pos.y);
			//Game.c.rotate(this.rotation);
		}
		// Draw shadow
		if (g_shadows_enabled) Game.c.drawImage(spr_shadow, -this.width/2, (this.height/2)-8, this.width, 16);
		// Draw sprite
		Game.c.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);

		Game.c.restore();

		Game.c.save();

		Game.c.translate(Math.round(this.pos.x), Math.round(this.pos.y));
		if (this.showHealthBar) this.healthBar.display(0, this.height/2 + 15);

		Game.c.restore();
	}
	isOnGrid() {
		if (Game.getCurrentState().map !== undefined) {
			if (this.tile.x/g_tileSize < Game.getCurrentState().map.cols && this.tile.y/g_tileSize < Game.getCurrentState().map.rows && this.tile.x/g_tileSize > 0 && this.tile.y/g_tileSize > 0) {
				return true;
			} else {
				return false;
			}
		}
	}
	destroy() {
		// Play death noise
		this.deathSound.play();
		this.deathSound.currentTime = 0;
		// Spawn blood particles
		particleSystem.spawnParticle('420s' + particleSystem.particles.length, p_plus_1, this.pos.x, this.pos.y, 16, 16, 10, -1.5, 30, 5);
		// Drop powerup
		if (random(0, 100) < 3 && !this.powerupDropped) {
			this.dropPowerup();
			this.powerupDropped = true;
		}
		// Cancel easystar pathfinding
		easystar.cancelPath(this.pathInstanceId);
		// Destroy collision body
		this.parent.removeEntity(this);
	}
	dropPowerup() {
		let id = 'powerup' + entityManager.powerups.length;

		entityManager.spawnPowerup(id, this.powerupSprite, this.pos.x, this.pos.y, 48, 48, function() {

			let powerupTime = 5000;

			if (!player.powerupActive) {
				player.powerupActive = true;

				console.log(this.id + ' picked up.');

				player.inventory.selectSlot( Math.round( random(1, 3) ) );

				let timer = new Timer(function() {
					player.inventory.selectSlot(0);
					player.powerupActive = false;
				}, powerupTime);

				return true;
			} else {
				return false;
			}
		});
	}
	run() {
		this.update();
		this.display();
	}
}
