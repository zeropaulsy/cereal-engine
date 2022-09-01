// EnemySpawner Class : EnemySpawner(maximum enemies, ticks to spawn, current time to spawn)
function EnemySpawner(max, spawnTime, spawnTimer, active, amount, callback) {
	this.max = max;
	this.spawnTime  = spawnTime;
	this.spawnTimer = spawnTimer;
	this.active = active;
	this.callback = callback;
	this.amount = amount;
	EnemySpawner.prototype.update = function() {
		if (this.active) {
			this.spawnTimer -= g_speed * deltaTime;
			if (this.spawnTimer < 0) {
				this.spawnTimer = this.spawnTime;
				for (let i = 0; i < this.amount; i++) {
					this.callback();
				}
			}
		}
	}
	EnemySpawner.prototype.run = function() {
		if (!g_paused) this.update();
	}
}