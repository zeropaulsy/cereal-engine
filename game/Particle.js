// Particle Class : Particle(id, sprite, x, y, w, h, velocity, angle, health, dither)
class Particle {
  constructor(id, sprite, x, y, width, height, velocity, direction, health, dither) {
    this.id = id;
    this.parent = particleSystem;
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
    this.angle = 0;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.dampen(0.9);
    this.vel.y += g_gravity;

    this.health -= g_speed * deltaTime;

    if (this.health <= 0) this.destroy();
  }
  display() {
    Game.c.save();

    Game.c.translate(this.pos.x, this.pos.y);
    Game.c.rotate(this.angle);
    //Game.c.shadowColor = 'rgba(0, 0, 0, 0.5)';
    //Game.c.shadowOffsetX = 5;
    //Game.c.shadowOffsetY = 5;
    Game.c.drawImage(this.sprite, -(this.width + this.health)/2, -(this.height + this.health)/2, this.width + this.health, this.height + this.health);

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
