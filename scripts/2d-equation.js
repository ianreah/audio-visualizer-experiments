require(['AudioAnalyser', 'jquery', 'jquery-ui.tabs'], function (audioAnalyser, $) {
	if (audioAnalyser.supported === false) {
		$(".hideIfNoApi").hide();
        $(".showIfNoApi").show();
        return;
	}
	
	$("#tabs").tabs({
		beforeActivate: function (event, ui) {
			switch (ui.newTab.index()) {
				case 0:
					audioAnalyser.fromMediaPlayer();
					break;
				case 1:
					audioAnalyser.fromLocalSource();
					break;
			}
		}
	});

    // Create the analyser & audio routing
	audioAnalyser.initialise($("#player"), 32, 0.4);
	audioAnalyser.fromMediaPlayer();

    // Set up the visualisation elements
    var canvas = $("#mainCanvas")[0];
    var canvasContext = canvas.getContext("2d");
	var duplicateContext = $("#duplicatedCanvas")[0].getContext("2d");

    var imageData = canvasContext.createImageData(1, 1);
    var pixelData = imageData.data;

    // Subscribe to analyser updates
    audioAnalyser.onAnalyserUpdate(function (e) {
		var averagedData = new Array(0,0,0,0);
		for (var index = 0; index < audioAnalyser.frequencyBinCount(); index++) {
			averagedData[Math.floor(index/4)] += (e.frequencyData[index]/4);
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
    });
	
    audioAnalyser.displayFps($('#fps'));
});