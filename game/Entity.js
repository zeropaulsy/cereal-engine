// Entity Class
class Entity {
	constructor(id, sprite, x, y, width, height) {
		this.id 	   = id;
		this.showId    = false;
		this.sprite    = sprite;
		this.pos 	   = new Vector(x, y);
		this.vel 	   = new Vector(0, 0);
		this.tile 	   = new Vector();
		this.width 	   = width;
		this.height    = height;
		this.hitbox    = new CollisionBody(this, width, height, true, 2);
		this.sWidth    = 1;
		this.sHeight   = 1;
		this.parent    = entityManager;
		this.knockBack = 15;
		this.angle     = 1;
		this.rotation  = 0;
		this.enableRotation = true;
	}
	// Destruction
	destroy() {
		this.parent.removeEntity(this);
	}
	explode(audio, p1, p2, p3) {
		// Play sound
		audio.play(0, 0, true);
		// Create explosion
		new Explosion(this.pos.x, this.pos.y, 32, 32, 4, 20, 10, 10, p1, p2, p3);
		// Destroy entity
		this.parent.removeEntity(this);
	}
	// Rendering
	drawSprite(sprite, offset, callback) {
		this.callback = callback || null;
		// Check if entity is on screen
        if ( this.isOnScreen() ) {
            // Save transform
            Game.c.save();
            // Translate sprite to entity position
            Game.c.translate(this.pos.x + offset, this.pos.y + offset);
            // Flip sprite if upside down
            if (this.enableRotation) {
                if (this.rotation < -1.5 || this.rotation > 1.5) {
                   	Game.c.scale(this.sWidth,-this.sHeight);
                    Game.c.rotate(-this.rotation );
                } else {
                   	Game.c.scale(this.sWidth, this.sHeight);
                    Game.c.rotate( this.rotation );
                }
            } else {
            	Game.c.scale(this.sWidth, this.sHeight);
            }
            // Draw entity sprite with origin in center
            Game.c.drawImage(sprite, -this.width/2, -this.height/2, this.width, this.height);
            if (this.callback) this.callback();
            // Restore transform
            Game.c.restore();
        }
	}
	setSpriteScale(x, y) {
		this.sWidth  = x;
		this.sHeight = y;
	}
	// Collision
	handleCollision(exclude, callback) {
        for (let i = 0; i < this.parent.entities.length; i++) {
        	let e = this.parent.entities[i];
            if (e == this || e.entityType == exclude || this.entityType == e.entityType) {
            	continue;
            }
            if ( e.hitbox.type == 1 && this.inRangeOf(e, 0) ) this.rectCollision(e, callback);
            if ( e.hitbox.type == 2 ) this.circleCollision(e, callback);
        }
    }
    inRangeOf(e, range) {
		let dx = (this.pos.x) - (e.pos.x),
			dy = (this.pos.y) - (e.pos.y),
			angle = Math.atan2(dx, dy);
		// Combined radius of the two shapes
		var radii = (this.hitbox.w / 2) + (e.hitbox.w / 2) + (range);
		// Compare distance to radii
		if ((dx * dx) + (dy * dy) < radii * radii) {
			return true;
		} else {
			return false;
		}
	}
    circleCollision(e, callback) {
        let dx = (this.pos.x) - (e.pos.x);
        let dy = (this.pos.y) - (e.pos.y);
        this.angle = Math.atan2(dx, dy);
        // Combined radius of the two shapes
        var radii = (e.hitbox.w / 2) + (this.hitbox.h / 2);
        // Compare distance to radii
        if ((dx * dx) + (dy * dy) < radii * radii) {
            // Move object to edge of shapeB
            e.pos.x += Math.sin(this.angle) / radii;
            e.pos.y += Math.cos(this.angle) / radii;
            // Set shapeA velocity to knock-back of shapeA
            e.vel.x += Math.sin(this.angle) * -e.knockBack;
            e.vel.y += Math.cos(this.angle) * -e.knockBack;
            callback(e, this);
        }
    }
    rectCollision(e, callback) {
        // Get the vectors to check against
		let vA = new Vector(e.pos.x - this.pos.x, e.pos.y - this.pos.y),
			// Add the half widths and half heights of the objects
			hWidths  = (e.hitbox.w / 2) + (this.hitbox.w / 2),
			hHeights = (e.hitbox.h / 2) + (this.hitbox.h / 2),
			colDir = null;
		if (Math.abs(vA.x) < hWidths && Math.abs(vA.y) < hHeights) {
			// Figures out on which side we are colliding (top, bottom, left, or right)
			let vR = new Vector(hWidths - Math.abs(vA.x), hHeights - Math.abs(vA.y));
			if (vR.x >= vR.y) {
				if (vA.y > 0) {
					colDir = "t", e.pos.y += vR.y, e.vel.y = e.knockBack, callback(e, this);
				} else {
					colDir = "b", e.pos.y -= vR.y, e.vel.y =-e.knockBack, callback(e, this);
				}
			} else {
				if (vA.x > 0) {
					colDir = "l", e.pos.x += vR.x, e.vel.x = e.knockBack, callback(e, this);
				} else {
					colDir = "r", e.pos.x -= vR.x, e.vel.x =-e.knockBack, callback(e, this);
				}
			}
		}
		return colDir;
    }
	// Position
	isOnScreen() {
		if (this.pos.x + this.width < this.width/2) {
			return false;
		} 
		else if (this.pos.x - this.width > width - this.width/2) {
			return false;
		} 
		else if (this.pos.y + this.height < this.height/2) {
			return false;
		} 
		else if (this.pos.y - this.height > height - this.height/2) {
			return false;
		} 
		else {
			return true;
		}
	}
	isOnGrid() {
		if (Game.getCurrentState().map !== undefined) {
			if (this.tile.x/g_tileSize < Game.getCurrentState().map.cols && this.tile.y/g_tileSize < Game.getCurrentState().map.rows && this.tile.x/g_tileSize > 0 && this.tile.y/g_tileSize > 0) {
				return true;
			} else {
				return false;
			}
		}
	}
	getTilePosition() {
		return {
			x: Math.floor(this.pos.x/g_tileSize)*g_tileSize,
			y: Math.floor(this.pos.y/g_tileSize)*g_tileSize
		}
	}
	getPosition() {
		return {
			x: this.pos.x, 
			y: this.pos.y
		}
	}
	setPosition(x, y) {
		this.pos.x = x;
		this.pos.y = y;
	}
	constrainToScreen() {
		if (this.pos.x < this.width/2) {
			this.vel.x = 0;
			this.pos.x = this.width/2;
		}
		if (this.pos.x > width - this.width/2) {
			this.vel.x = 0;
			this.pos.x = width - this.width/2;
		}
		if (this.pos.y < this.height/2) {
			this.vel.y = 0;
			this.pos.y = this.height/2;
		}
		if (this.pos.y > height - this.height/2) {
			this.vel.y = 0;
			this.pos.y = height - this.height/2;
		}
	}
	// Velocity
	getVelocity() {
		return {
			x: this.vel.x, 
			y: this.vel.y
		}
	}
	setVelocity(x, y) {
		this.vel.x = x;
		this.vel.y = y;
	}
	addVelocity(x, y) {
		this.vel.x += x;
		this.vel.y += y;
	}
	applyVelocity(friction) {
		this.pos.add(this.vel);
		this.vel.dampen(friction);
	}
	// Rotation
	getRotation() {
		return this.rotation;
	}
	setRotation(rotation) {
		this.rotation = rotation;
	}
	addRotation(rotation) {
		this.rotation += rotation;
	}
	// Size
	getSize() {
		return {
			width : this.width,
			height: this.height
		}
	}
	setSize(width, height) {
		this.width    = width;
		this.height   = height;
		this.hitbox.w = width;
		this.hitbox.h = height;
	}
}