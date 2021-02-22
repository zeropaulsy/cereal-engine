// Enemy Class : Enemy(id, sprite, target, x, y, width, height, speed, health, death sound, score value)
class Enemy {
	constructor(id, sprite, target, x, y, width, height, showHealthBar, speed, health, deathSound, scoreValue) {
		this.entityType = 'enemy';
		this.id = id;
		this.showId = false;
		this.sprite = sprite;
		this.target = target;
		this.pos = new Vector(x, y);
		this.vel = new Vector();
		this.tile = new Vector();
		this.width = width;
		this.height = height;
		this.hitbox = {w: width, h: height};
		this.speed = speed;
		this.health = health;
		this.maxHealth = health;
		this.showHealthBar = showHealthBar;
		this.healthBar = new HealthBar(id + '_healthbar', this, width / 1.5, 7, '#f0f0dd', '#686e46');
		this.deathSound = deathSound;
		this.scoreValue = scoreValue;
		this.knockBack = 0;
		this.angle = 1;
		this.rotation = this.pos.angle(target.pos);
		this.rotationSpeed = random(0.875, 0.95);
		this.flipped = false;
		this.lastCollision = Object();
		this.kill = false;
		this.pathInstanceId = 'none';
		this.pathfinding = false;
	}
	update() {
		this.pos.add(this.vel);
		this.vel.multiply(0.875);
		this.tile.x = Math.floor(this.pos.x/g_tileSize)*g_tileSize;
		this.tile.y = Math.floor(this.pos.y/g_tileSize)*g_tileSize;
		// Calculate angle to face based on position of target
		if (!this.pathfinding) {
			this.angle = this.pos.angle(this.target.pos);
			this.rotation = averageNums(this.rotation, this.angle, this.rotationSpeed);
		}
		// Set velocity to move in direction of angle
		this.vel.x += Math.cos(this.rotation) / this.speed;
		this.vel.y += Math.sin(this.rotation) / this.speed;
		// Collision between player
		if (collisionBetween2(this, player) && player.health > 1) {
			player.health -= 1;
			mp3_hurt.play();
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
			this.deathSound.play();
			this.deathSound.currentTime = 0;
			particleSystem.spawnParticle('420s' + particleSystem.particles.length, p_plus_1, this.pos.x, this.pos.y, 16, 16, 10, -1.5, 30, 5);
			this.kill = true;
		}
	}
	display() {
		// Draw tile player is on
		// Game.c.fillStyle = 'rgba(255, 0, 0, 0.5)';
		// Game.c.fillRect(this.tile.x, this.tile.y, g_tileSize, g_tileSize);

		Game.c.save();
		// Flip sprite if upside down
		if (this.flipped) {
			Game.c.scale(-1, 1);
			Game.c.translate(-this.pos.x, this.pos.y);
			//Game.c.rotate(-this.rotation);
		} else {
			Game.c.scale(1, 1);
			Game.c.translate(this.pos.x, this.pos.y);
			//Game.c.rotate(this.rotation);
		}
		// Draw shadow
		Game.c.drawImage(spr_shadow, -this.width/2, (this.height/2)-8, this.width, 16);
		// Draw sprite
		Game.c.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);

		Game.c.restore();

		Game.c.save();

		Game.c.translate(this.pos.x, this.pos.y);
		if (this.showHealthBar) this.healthBar.display(0, this.height/2 + 15);

		Game.c.restore();
	}
	run() {
		this.update();
		this.display();
	}
}
