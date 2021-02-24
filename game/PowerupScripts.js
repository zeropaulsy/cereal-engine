entityManager.spawnPowerup('bomb' + entityManager.powerups.length, spr_bomb, 200, 200, 28, 24, function() {

	let id = 'bomb' + entityManager.powerups.length;
	let lastCollision = entityManager.getEntityById(id).lastCollision;
	let currentInvSlot = player.inventory.slotActive;
	let powerupTime = 5000;

	console.log(id + ' picked up');

	if (currentInvSlot != 2) {
		lastCollision.inventory.slotActive = 2;

		let timer = new Timer(function() {
			lastCollision.inventory.slotActive = currentInvSlot;
		}, powerupTime);
	}
});

for (let i = 0; i < entityManager.turrets.length; i++) {
	entityManager.turrets[i].kill = true;
}
