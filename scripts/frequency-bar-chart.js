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
    audioAnalyser.initialise($("#player"), 64);
	audioAnalyser.fromMediaPlayer();
	
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