function findEntityPath(e, t) {
	// easystar js
	if ( !inRangeOf(e, t, g_tileSize * 2) ) {
		e.pathfinding = true;
		e.pathInstanceId = easystar.findPath(e.tile.x/g_tileSize, e.tile.y/g_tileSize, t.tile.x/g_tileSize, t.tile.y/g_tileSize, function(path) {
			if (path === null) {
				console.log("Path was not found. " + path);
			} else {
				e.path = path;
				easystar.cancelPath(e.pathInstanceId);
			}
		});
	} else {
		easystar.cancelPath(e.pathInstanceId);
		e.pathfinding = false;
	}
}

function contrastImage(imgData, contrast){  //input range [-100..100]
    var d = imgData.data;
    contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);
    for(var i=0;i<d.length;i+=4){   //r,g,b,a
        d[i] = d[i]*contrast + intercept;
        d[i+1] = d[i+1]*contrast + intercept;
        d[i+2] = d[i+2]*contrast + intercept;
    }
    return imgData;
}

function darkenImage(imgData, value, alpha) {
    var d = imgData.data;
    for(var i = 0; i < d.length; i += 4) {   //r,g,b,a
        d[i]   = d[i]   - value;
        d[i+1] = d[i+1] - value;
        d[i+2] = d[i+2] - value;
        d[i+3] = d[i+3] - alpha;
    }
    return imgData;
}

function generateShadow(image) {
	let shadow = document.createElement('canvas');
	let sc = shadow.getContext('2d');

	shadow.id = 'shadow';
    shadow.width = image.width;
    shadow.height = image.height;

    sc.drawImage(image, 0, 0, shadow.width, shadow.height);

    let imgData = sc.getImageData(0, 0, shadow.width, shadow.height);

    shadowData = darkenImage(imgData, 255, 127);
    sc.putImageData(shadowData, 0, 0);

    //var image = new Image();
    //image.src = shadow.toDataURL("image/png");
    //return image;
    return loadImage({ src : shadow.toDataURL("image/png") });
}


function canvasDataToImage(canvas) {
    // var image = new Image();
    // image.src = canvas.toDataURL("image/png");
    // return image;
    return loadImage({ src : canvas.toDataURL("image/png") });
}


function normalize(val, min, max) {
	return (val - min) / (max - min);
}

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decimalPlace(num, val) {
	return Math.round(num * val) / val;
}

function averageNums(a, b, f) {
	var avg = ( Math.atan2( Math.sin(a) * (f) + Math.sin(b) * (1 - f), Math.cos(a) * (f) + Math.cos(b) * (1 - f) ) );
	return avg;
}

function applyDeadzone(number, threshold) {
	percentage = (Math.abs(number) - threshold) / (1 - threshold);

	if (percentage < 0)
		percentage = 0;

	return percentage * (number > 0 ? 1 : -1);
}

let alternate = (function iife() {
    let lastValue = true;
    return function () {
        lastValue = !lastValue;
        return lastValue;
    };
}());
