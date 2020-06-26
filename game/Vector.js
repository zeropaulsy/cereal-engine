class Vector {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  add(vec, mult) {
    let m = mult || 1;
    this.x += (vec.x * m) * delta * maxFps;
    this.y += (vec.y * m) * delta * maxFps;
  }
  subtract(vec) {
    this.x -= vec.x * delta * maxFps;
    this.y -= vec.y * delta * maxFps;
  }
  multiply(value) {
    this.x *= value - delta;
    this.y *= value - delta;
  }
  equals(vec) {
    this.x = vec.x;
    this.y = vec.y;
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  angle(v) {
    let dx = v.x - this.x;
    let dy = v.y - this.y;
    return Math.atan2(dy, dx);
  }
  distance(v) {
    let dx = v.x - this.x;
    let dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  normalize() {
    let mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag);
  }
}
