function BackgroundManager(max, bg_selected) {
  this.max = max;
  this.screens = [];
  this.screenSelected = bg_selected;
  BackgroundManager.prototype.run = function() {
    let s = this.screens[this.screenSelected];

    s.run();
  }
  BackgroundManager.prototype.selectBackgroundScreen = function(id, callback) {
    this.callback = callback || function() {};
    this.callback();
    this.screenSelected = this.screens.findIndex(x => x.id === id);
  }
  BackgroundManager.prototype.getBackgroundById = function(id) {
    // Return screen with specified id
    return this.screens.find(x => x.id === id);
  }
}

function BackgroundScreen(id, images, alpha, func) {
  this.id = id;
  this.images = images;
  this.defaultImage = this.images[0];
  this.alpha = alpha;
  this.timer = new Timer(function(){}, 0);
  BackgroundScreen.prototype.update = function() {
    if (g_paused && !this.timer.paused) {
      console.log(this.id + ' background paused.');
      this.timer.pause();
    }
    if (!g_paused && this.timer.paused) {
      console.log(this.id + ' background resumed.');
      this.timer.resume();
    }
  }
  BackgroundScreen.prototype.display = function() {
    Game.c.save();

    Game.c.globalAlpha = this.alpha;

    for (let i = 0; i < this.images.length; i++) {
      Game.c.drawImage(this.images[i], 0, 0, 1280, 720);
    }

    Game.c.restore();
  }
  BackgroundScreen.prototype.run = function() {
    this.update();
    this.display();
  }
}
