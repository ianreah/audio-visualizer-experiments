define([], function() {
	// Future-proofing...
	var context;
	if (typeof AudioContext !== "undefined") {
		context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
		context = new webkitAudioContext();
	}

	return {
		supported: context !== undefined,
		fromMediaPlayer: function (mediaPlayer, fftSize, smoothingTimeConstant) {
			// Create the analyser
			var analyser = context.createAnalyser();
			
			if (fftSize !== undefined) {
				analyser.fftSize = fftSize;
			}
			
			if (smoothingTimeConstant !== undefined) {
				analyser.smoothingTimeConstant = smoothingTimeConstant;
			}
			
			// Hook up the audio routing...
			// player -> analyser -> speakers
			// (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
			mediaPlayer.bind('canplay', function () {
				var source = context.createMediaElementSource(this);
				source.connect(analyser);
				analyser.connect(context.destination);
			});

			return analyser;
		}
	};
});