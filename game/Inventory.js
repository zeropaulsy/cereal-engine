// Inventory Class : Inventory(Maximum Items, [contents])
class Inventory {
	constructor(max, contents) {
		this.max = max;
		this.slotActive = 0;
		this.contents = contents || [];
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
	getContentIds() {
		// Return array containing weapon ID strings
		let ids = [];
		for (let i = 0; i < this.contents.length; i++) {
			ids.push(this.contents[i].id);
		}
		return ids;
	}
	holsterItem() {
		// Holster current item
		this.contents[this.slotActive].onHolster();
		this.getEquippedItem().equipped = false;
	}
	equipItem(id) {
		// Holster current item
		if (this.getEquippedItem()) this.holsterItem();
		// Equip new item using the id specified
		this.getInventoryItem(id).equipped = true;
		// Select slot
		this.slotActive = this.contents.indexOf(this.getEquippedItem());
		// Call on equip function
		this.contents[this.slotActive].onEquip();
	}
	selectSlot(slot) {
		// Holster current item
		if (this.getEquippedItem()) this.holsterItem();
		// Select desired slot
		this.slotActive = slot;
		// Equip active slot
		this.contents[this.slotActive].equipped = true;
		// Call on equip function
		this.contents[this.slotActive].onEquip();
	}
}
