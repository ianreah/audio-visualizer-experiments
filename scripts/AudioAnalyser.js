define(['jquery', 'jsFrames.min'], function ($, jsFrames) {
	// Future-proofing...
	var context;
	if (typeof AudioContext !== "undefined") {
		context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
		context = new webkitAudioContext();
	}

	var pubsub = $({});
	var updateEventName = "analyser.update";
	var analyser;

	// Hook up the audio routing...
	// player -> analyser -> speakers
	function hookUpAudioRouting(player) {
		var source = context.createMediaElementSource(player);
		source.connect(analyser);
		analyser.connect(context.destination);
	}
	
	return {
	    supported: context !== undefined,

		fromMediaPlayer: function (mediaPlayer, fftSize, smoothingTimeConstant) {
			// Create the analyser
			analyser = context.createAnalyser();
			
			if (fftSize !== undefined) {
				analyser.fftSize = fftSize;
			}
			
			if (smoothingTimeConstant !== undefined) {
				analyser.smoothingTimeConstant = smoothingTimeConstant;
			}
			
			// Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4
			if (mediaPlayer[0].readyState > 2) {
				// We may have missed the canplay event already
				hookUpAudioRouting(mediaPlayer[0]);
			} else {
				mediaPlayer.bind('canplay', function() {
					hookUpAudioRouting(this);
				});
			}

			var updateEvent = jQuery.Event(updateEventName);
			updateEvent.frequencyData = new Uint8Array(analyser.frequencyBinCount);

			jsFrames.registerAnimation(function () {
			    // Get the frequency data and trigger an update
			    analyser.getByteFrequencyData(updateEvent.frequencyData);
			    pubsub.trigger(updateEvent);
			});

		    // TODO: subscribe to frames per second

			jsFrames.start();
		},

		onAnalyserUpdate: function (update) {
		    pubsub.bind(updateEventName, update);
		},

		frequencyBinCount: function () {
		    return analyser.frequencyBinCount;
		}
	};
});