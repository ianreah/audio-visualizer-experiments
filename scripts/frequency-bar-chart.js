require(['jquery', 'jsFrames.min'], function ($, jsFrames) {
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

    // Create the analyser
    var analyser = context.createAnalyser();
    analyser.fftSize = 64;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Set up the visualisation elements
    var visualisation = $("#visualisation");
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
        $("<div/>").css("left", i * 15 + "px")
			.appendTo(visualisation);
    }
    var bars = $("#visualisation > div");

    jsFrames.registerAnimation(function () {
    	// Get the frequency data and update the visualisation
    	analyser.getByteFrequencyData(frequencyData);

        bars.each(function (index, bar) {
            bar.style.height = frequencyData[index] + 'px';
        });
    });

    var theFpsDisplay = $('#fps');
    jsFrames.onFpsUpdate(function (fps) {
    	theFpsDisplay.html(fps);
    });
	
    // Hook up the audio routing...
    // player -> analyser -> speakers
	// (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
	$("#player").bind('canplay', function() {
		var source = context.createMediaElementSource(this);
		source.connect(analyser);
		analyser.connect(context.destination);
	});

    // Kick it off...
    jsFrames.start();
});