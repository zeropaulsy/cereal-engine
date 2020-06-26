// ParticleSystem Class : ParticleSystem(Maximum_Particles)
class ParticleSystem {
  constructor(max) {
    this.max = max;
    this.particles = [];
  }
  run() {
    // Loop through particles array
    for (let i = this.particles.length-1; i >= 0; i--) {
      var p = this.particles[i];
      if (p.kill) {
        // Remove particle from array when killed
        this.particles.splice(i, 1);
      }

      if (!g_paused) p.update();
      p.display();
    }
  }
  spawnParticle(id, spr, x, y, w, h, v, a, l, d) {
    if (this.particles.length < this.max) {
      this.particles.push(new Particle(id, spr, x, y, w, h, v, a, l, d));
    } else {
      // Log warning if particle limit reached or exceeded
      console.warn('Could not spawn particle. Maximum number of particles reached: ' + this.max);
    }
  }
}