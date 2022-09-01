// Particle Class : Particle(id, sprite, x, y, w, h, velocity, angle, health, dither)
class Particle  {
    constructor(id, sprite, x, y, width, height, velocity, direction, health, dither) {
        // Class specific properties
        this.parent = particleSystem;
        this.id = id;
        this.sprite = sprite;
        this.pos = new Vector(x, y);
        this.vel = new Vector(
            Math.cos(direction) * velocity + random(-dither, dither),
            Math.sin(direction) * velocity + random(-dither, dither)
        );
        this.width = width;
        this.height = height;
        this.health = health;
        this.dither = dither;
        this.drain = 1;
        this.angle = 0;
        this.friction = 0.9;
    }
    update() {
        this.pos.add(this.vel);
        this.vel.dampen(this.friction);
        this.vel.y += g_gravity;

        this.health -= (this.drain * g_speed) * deltaTime;

        if (this.health <= 0) this.destroy();
    }
    display() {
        Game.c.save();

        Game.c.translate(this.pos.x, this.pos.y);
        Game.c.rotate(this.angle);
        if (!this.sprite.image) {
            Game.c.drawImage(this.sprite, -(this.width + this.health) / 2, -(this.height + this.health) / 2, this.width + this.health, this.height + this.health);
        } else {
            Game.c.drawImage(this.sprite.image, -(this.width + this.health) / 2, -(this.height + this.health) / 2, this.width + this.health, this.height + this.health);
        }

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