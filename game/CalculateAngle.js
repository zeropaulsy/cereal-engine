self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.worker_message) {
    case 'find_target':

      for (var target, d = Number.MAX_VALUE, i = 0; i < entityManager.enemies.length; i++) {
        let enemy = entityManager.enemies[i],
          distance = Math.pow(this.pos.x - enemy.pos.x, 2) + Math.pow(this.pos.y - enemy.pos.y, 2);
        distance < d && (target = enemy, d = distance)
      }

      break;
    case 'calculate_angle':
      // Find the vector AB
			this.ABx = data.target.x - data.turret.x;
		  this.ABy = data.target.y - data.turret.y;

			// Normalize it
			this.ABmag = Math.sqrt(this.ABx * this.ABx + this.ABy * this.ABy);
			this.ABx /= this.ABmag;
			this.ABy /= this.ABmag;

			// Project u onto AB
			this.uDotAB = this.ABx * data.targetVel.x + this.ABy * data.targetVel.y
			this.ujx = this.uDotAB * this.ABx;
			this.ujy = this.uDotAB * this.ABy;

			// Subtract uj from u to get ui
			this.uix = data.targetVel.x - this.ujx;
			this.uiy = data.targetVel.y - this.ujy;

			// Set vi to ui (for clarity)
			this.vix = this.uix;
			this.viy = this.uiy;

			// Calculate the magnitude of vj
			this.viMag = Math.sqrt(this.vix * this.vix + this.viy * this.viy);
			this.vjMag = Math.sqrt(data.vMag * data.vMag - this.viMag * this.viMag);

			// Get vj by multiplying it's magnitude with the unit vector AB
			this.vjx = this.ABx * this.vjMag;
			this.vjy = this.ABy * this.vjMag;

			// Add vj and vi to get v
			this.vx = this.vjx + this.vix;
			this.vy = this.vjy + this.viy;

      // Post result back to main thread
      self.postMessage({
				'vx': this.vx,
        'vy': this.vy
			});
      break;
  };
}, false);
