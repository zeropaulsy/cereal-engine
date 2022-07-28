// Turret Class
class Turret {
	constructor(id, sprite, target, x, y, width, height, health, ammo, rotationSpeed, stationary) {
		this.entityType = 'turret';
		this.id = id;
		this.sprite = sprite;
		this.pos = new Vector(x, y);
		this.vel = new Vector();
		this.width = width;
		this.height = height;
		this.hitbox = {w: width, h: height};
		this.health = health;
		this.maxHealth = health;
		this.ammo = ammo;
		this.target = target;
		this.angle = 1;
		this.rotation = 1;
		this.rotationSpeed = rotationSpeed;
		this.stationary = stationary;
		this.speed = 4;
		this.knockBack = 10;
		this.hitbox.lastCollision = Object();
		this.kill = false;
		this.inventory = new Inventory(5);
		this.inventory.contents.push(new Gun('staff00', spr_staff_orange, p_orange, this, this.width, this.height, 16, 16, 1, 20, 1, 1, audio.mp3_hitmarker, p_red_small, true));
		this.inventory.contents.push(new Gun('staff01', spr_staff_orange, p_orange, this, this.width, this.height, 16, 16, 1, 10, 2, 0.75, audio.mp3_hitmarker, p_red_small, false));
		this.healthBar = new HealthBar(this.id + '_health_bar', this, 55, 7, '#ce9069', '#51bf59');
	}
	update() {

		this.calculateAngle();
		if (isNaN(this.rotation)) this.rotation = 1, console.warn(this.id + ': Could not calculate rotation. Instead set to 1.');

  	this.pos.add(this.vel);
    this.vel.multiply(0.99);

  	if (this.health < 0) this.kill = true;
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
		Game.c.translate(this.pos.x, this.pos.y + Math.sin(this.rotation)*10);
		Game.c.drawImage(spr_shadow, -this.width/2, (this.height/2)-8, this.width, 16);

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
		      let enemy = entityManager.enemies[i],
		          distance = Math.pow(this.pos.x - enemy.pos.x, 2) + Math.pow(this.pos.y - enemy.pos.y, 2);
		      distance < d && (target = enemy, d = distance)
		    }

			// Find the vector AB
			this.ABx = target.pos.x - this.pos.x;
		  this.ABy = target.pos.y - this.pos.y;

			// Normalize it
			this.ABmag = Math.sqrt(this.ABx * this.ABx + this.ABy * this.ABy);
			this.ABx /= this.ABmag;
			this.ABy /= this.ABmag;

			// Project u onto AB
			this.uDotAB = this.ABx * target.vel.x + this.ABy * target.vel.y
			this.ujx = this.uDotAB * this.ABx;
			this.ujy = this.uDotAB * this.ABy;

			// Subtract uj from u to get ui
			this.uix = target.vel.x - this.ujx;
			this.uiy = target.vel.y - this.ujy;

			// Set vi to ui (for clarity)
			this.vix = this.uix;
			this.viy = this.uiy;

			// Current weapon projectile speed
			this.vMag = this.inventory.getEquippedItem().speed;

			// Calculate the magnitude of vj
			this.viMag = Math.sqrt(this.vix * this.vix + this.viy * this.viy);
			this.vjMag = Math.sqrt(this.vMag * this.vMag - this.viMag * this.viMag);

			// Get vj by multiplying it's magnitude with the unit vector AB
			this.vjx = this.ABx * this.vjMag;
			this.vjy = this.ABy * this.vjMag;

			// Add vj and vi to get v
			this.vx = this.vjx + this.vix;
			this.vy = this.vjy + this.viy;

	    this.angle = Math.atan2(this.vy, this.vx);
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
