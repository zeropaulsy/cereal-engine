// ParticleSystem Class : ParticleSystem(Maximum_Particles)
class ParticleSystem {
    constructor(max) {
        this.max = max;
        this.particles = [];
    }
    run() {
        // Loop through particles array
        for (let i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];

            if (!g_paused) p.update();
            p.display();
        }
    }
    spawnParticle(p) {
        // let particle = new Particle(id, spr, x, y, width, height, velocity, direction, health, dither);
        if (this.particles.length < this.max) {
            this.particles.push(p);
        } else {
            // If particle limit reached increase speen in which particle dies
            this.particles[this.particles.length - 1].drain = 10;
            // Spawn new particle
            this.particles.push(p);
        }
    }
    removeParticle(p) {
        // Remove particle from array when killed
        let i = this.particles.indexOf(p);
        return this.particles.splice(i, 1);
    }
}