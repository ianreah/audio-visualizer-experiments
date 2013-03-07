require(['jquery', 'AudioAnalyser'], function ($, audioAnalyser) {
	if(audioAnalyser.supported === false) {
        $(".hideIfNoApi").hide();
        $(".showIfNoApi").show();
        return;
    }

    // Create the analyser & audio routing
	audioAnalyser.fromMediaPlayer($("#player"), 64);
	
	// Set up the visualisation elements
    var visualisation = $("#visualisation");
    for (var i = 0; i < audioAnalyser.frequencyBinCount(); i++) {
        $("<div/>").css("left", i * 15 + "px")
			.appendTo(visualisation);
    }
    var bars = $("#visualisation > div");

    // Subscribe to analyser updates
    audioAnalyser.onAnalyserUpdate(function (e) {
        bars.each(function (index, bar) {
            bar.style.height = e.frequencyData[index] + 'px';
        });
    });

	audioAnalyser.displayFps($('#fps'));
});