// Particle Class : Particle(id, sprite, x, y, w, h, velocity, angle, health, dither)
class Particle extends Entity {
    constructor(id, sprite, x, y, width, height, velocity, direction, health, dither) {
        // Call properties from Entity class
        super(id, sprite, x, y, width, height);
        // Class specific properties
        this.vel = new Vector(
            Math.cos(direction) * velocity + random(-dither, dither),
            Math.sin(direction) * velocity + random(-dither, dither)
        );
        this.parent = particleSystem;
        this.health = health;
        this.dither = dither;
        this.angle  = 0;
        this.friction = 0.9;
    }
    update() {
        this.applyVelocity();
        this.vel.y += g_gravity;

        this.health -= g_speed * deltaTime;

        if (this.health <= 0) this.destroy();
    }
    display() {
        Game.c.save();

        Game.c.translate(this.pos.x, this.pos.y);
        Game.c.rotate(this.angle);
        Game.c.drawImage(this.sprite, -(this.width + this.health) / 2, -(this.height + this.health) / 2, this.width + this.health, this.height + this.health);

        Game.c.restore();
    }
    destroy() {
        // Destroy particle
        this.parent.removeParticle(this);
    }
    run() {
        this.update();
        this.display();
    }
}