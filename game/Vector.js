class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    add(vec, mult) {
        let m = mult || 1;
        this.x += ((vec.x * m) * (g_speed)) * deltaTime;
        this.y += ((vec.y * m) * (g_speed)) * deltaTime;
    }
    subtract(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    }
    multiply(value) {
        this.x *= value;
        this.y *= value;
    }
    dampen(value) {
        this.x *= averageNums(value, 1, g_speed);
        this.y *= averageNums(value, 1, g_speed);
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