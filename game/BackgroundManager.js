class BackgroundManager {
    constructor(max, bg_selected) {
        this.max = max;
        this.screens = [];
        this.screenSelected = bg_selected;
    }
    selectBackgroundScreen(id, callback) {
        this.callback = callback || function() {};
        this.callback();
        this.screenSelected = this.screens.findIndex(x => x.id === id);
    }
    getBackgroundById(id) {
        // Return screen with specified id
        return this.screens.find(x => x.id === id);
    }
    run() {
        let s = this.screens[this.screenSelected];
        s.run();
    }
}

class BackgroundScreen {
    constructor(id, images, alpha, gifs) {
        this.id = id;
        this.images = images;
        this.gifs = gifs || null;
        this.defaultImage = this.images[0];
        this.alpha = alpha;
        this.timer = timerManager.addTimer(function() {}, 0);
    }
    drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

        if (arguments.length === 2) {
            x = y = 0;
            w = ctx.canvas.width;
            h = ctx.canvas.height;
        }

        // default offset is center
        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;

        // keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        var iw = img.width,
            ih = img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,   // new prop. width
            nh = ih * r,   // new prop. height
            cx, cy, cw, ch, ar = 1;

        // decide which gap to fill    
        if (nw < w) ar = w / nw;                             
        if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
    }
    display() {
        Game.c.save();

        Game.c.globalAlpha = this.alpha;
        Game.c.imageSmoothingEnabled = false;

        if (this.gifs) {
            for (let i = 0; i < this.gifs.length; i++) {
                // if (!this.gifs[i].loading) Game.c.drawImage(this.gifs[i].image, 0, 0, width, height);
                if (!this.gifs[i].loading) this.drawImageProp(Game.c, this.gifs[i].image, 0, 0, width, height);
            }
        }

        for (let i = 0; i < this.images.length; i++) {
            this.drawImageProp(Game.c, this.images[i], 0, 0, width, height);
        }

        Game.c.restore();
    }
    run() {
        this.display();
    }
}