// Particle Class : Particle(id, sprite, x, y, w, h, velocity, angle, health, dither)
class Particle {
  constructor(id, sprite, x, y, width, height, velocity, direction, health, dither) {
    this.id = id;
    this.sprite = sprite;
    this.pos = new Vector(x, y);
    this.vel = new Vector(
      (Math.cos(direction) * velocity) + random(-dither, dither),
      (Math.sin(direction) * velocity) + random(-dither, dither)
    );
    this.width = width;
    this.height = height;
    this.health = health;
    this.dither = dither;
    this.angle = 0;
    this.kill = false;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.multiply(0.9);
    this.vel.y += g_gravity;

    this.health--;

    if (this.health <= 0) this.kill = true;
  }
  display() {
    Game.c.save();

    Game.c.translate(this.pos.x, this.pos.y);
    Game.c.rotate(this.angle);
    Game.c.drawImage(this.sprite, -(this.width + this.health)/2, -(this.height + this.health)/2, this.width + this.health, this.height + this.health);

    Game.c.restore();
  }
  run() {
    this.update();
    this.display();
  }
}
