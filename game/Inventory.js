// Inventory Class : Inventory(Maximum Items)
class Inventory {
	constructor(max) {
		this.max = max;
		this.slotActive = 0;
		this.contents = [];
	}
	run() {
		// Overflow inventory position
		if (this.slotActive > this.contents.length - 1) this.slotActive = 0;
		if (this.slotActive < 0) this.slotActive = this.contents.length - 1;
		// Loop through inventory and render only when equipped
		for (let i = this.contents.length - 1; i >= 0; i--) {
			let inv = this.contents[i];
			inv.update();
			if (inv.equipped) inv.display();
		}
	}
	getInventoryItem(id) {
		// Return inventory item with specified id
		return this.contents.find(x => x.id === id);
	}
	getEquippedItem() {
		// Return the item currently equipped to the player
		return this.contents.find(x => x.equipped === true);
	}
	equipItem(id) {
		// Find item currently equipped using getEquippedItem()
		this.getEquippedItem().equipped = false;
		// Equip new item using the id specified
		this.getInventoryItem(id).equipped = true;
	}
	selectSlot(slot) {
		// Find item currently equipped using getEquippedItem()
		this.getEquippedItem().equipped = false;
		// Select desired slot
		this.slotActive = slot;
		// Equip active slot
		this.contents[this.slotActive].equipped = true;
		// Call on equip function
		this.contents[this.slotActive].onEquip();
	}
}
