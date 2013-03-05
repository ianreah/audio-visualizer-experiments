$(function () {
    // Future-proofing...
    var context;
    if (typeof AudioContext !== "undefined") {
        context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        context = new webkitAudioContext();
    } else {
        $(".hideIfNoApi").hide();
        $(".showIfNoApi").show();
        return;
    }

    // Overkill - if we've got Web Audio API, surely we've got requestAnimationFrame. Surely?...
    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                    || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };

    // Create the analyser
    var analyser = context.createAnalyser();
    analyser.fftSize = 32;
	analyser.smoothingTimeConstant = 0.4;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    var canvas = $("#mainCanvas")[0];
    var canvasContext = canvas.getContext("2d");
	var duplicateContext = $("#duplicatedCanvas")[0].getContext("2d");

    var imageData = canvasContext.createImageData(1, 1);
    var pixelData = imageData.data;

    // Get the frequency data and update the visualisation
    function update() {
        requestAnimationFrame(update);
        analyser.getByteFrequencyData(frequencyData);
		
		var averagedData = new Array(0,0,0,0);
		for(var index = 0; index < analyser.frequencyBinCount; index++) {
			averagedData[Math.floor(index/4)] += (frequencyData[index]/4);
		}

		// r,g,b from the higher 3 frequency bins
		// scaled 127 - 255 to keep it bright
        pixelData[0] = averagedData[1] / 2 + 127;
        pixelData[1] = averagedData[2] / 2 + 127;
        pixelData[2] = averagedData[3] / 2 + 127;

		// Taken from here - http://ejohn.org/apps/processing.js/examples/basic/graphing2dequation.html
        var n = (averagedData[0] * 10.0) / 255;
        var w = 16.0;      // 2D space width
        var h = 16.0;      // 2D space height
        var dx = w / 255;  // Increment x this amount per pixel
        var dy = h / 255;  // Increment y this amount per pixel
        var x = -w/2;      // Start x at -1 * width / 2
        for (var i = 0; i < 255; i++) {
            var y = -h/2;  // Start y at -1 * height / 2
            for (var j = 0; j < 255; j++) {
			    // Convert cartesian to polar
                var r = Math.sqrt((x*x) + (y*y));
                var theta = Math.atan2(y,x);
				
                // Compute 2D polar coordinate function
				// Results in a value between -1 and 1
                var val = Math.sin(n*Math.cos(r) + 5 * theta);
				
				// Some other simple functions...
                // var val = Math.cos(r);
                // var val = Math.sin(theta);
				
				// Then computed val is used for the alpha
                pixelData[3] = ((val + 1.0) * 255.0 / 2.0);;
                canvasContext.putImageData(imageData, i, j);
				
                y += dy;  // Increment y
            }
            x += dx;  // Increment x
        }
		
		// Duplicate the canvas
		duplicateContext.clearRect(0, 0, 255, 255);
		duplicateContext.drawImage(canvas, 0, 0);
    };

    // Hook up the audio routing...
    // player -> analyser -> speakers
	// (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
	$("#player").bind('canplay', function() {
		var source = context.createMediaElementSource(this);
		source.connect(analyser);
		analyser.connect(context.destination);
	});
	
    // Kick it off...
    update();
});