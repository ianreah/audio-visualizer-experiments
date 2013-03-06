require(['jquery', 'jsFrames.min', 'AudioAnalyser'], function ($, jsFrames, audioAnalyser) {
	if(audioAnalyser.supported === false) {
        $(".hideIfNoApi").hide();
        $(".showIfNoApi").show();
        return;
    }

    // Create the analyser
	var analyser = audioAnalyser.fromMediaPlayer($("#player"), 64);
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
	
    // Kick it off...
    jsFrames.start();
});