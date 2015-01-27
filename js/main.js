var audioClipBuffer = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var analyzer = null;

function loadAudioClip(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  console.log('what');

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      audioClipBuffer = buffer;
      // playSound(audioClipBuffer);
      setupAudioNodes(buffer);
    }, onError);
  }

  function onError(e) {
  	console.log(e);
  }
  request.send();
}

function playSound(buffer) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = audioClipBuffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
}

function getAverageVolume(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}

function setupAudioNodes(buffer) {
 
        // setup a javascript node
        javascriptNode = context.createScriptProcessor(2048, 1, 1);
        // connect to destination, else it isn't called
        javascriptNode.connect(context.destination);

        // when the javascript node is called
		// we use information from the analyzer node
		// to draw the volume
		javascriptNode.onaudioprocess = function() {

		    // get the average, bincount is fftsize / 2
		    var array =  new Uint8Array(analyzer.frequencyBinCount);
		    analyzer.getByteFrequencyData(array);
		    var average = getAverageVolume(array);

		    ctx.clearRect(0, 0, canvas.width, canvas.height);

		    Circle.draw(average);
		}
 
        // setup a analyzer
        analyzer = context.createAnalyser();
        analyzer.smoothingTimeConstant = 0.3;
        analyzer.fftSize = 1024;
 
        // create a buffer source node
		var source = context.createBufferSource(); // creates a sound source
		source.buffer = buffer;                    // tell the source which sound to play
 
        // connect the source to the analyser
        source.connect(analyzer);
 
        // we use the javascript node to draw at a specific interval.
        analyzer.connect(javascriptNode);
 
        // and connect to destination, if you want audio
       source.connect(context.destination);

       source.start(0);  // play the source now
    }


document.addEventListener('click', function() {
	// loadAudioClip('audio/woohoo.mp3');
});

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

navigator.getUserMedia = ( navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||navigator.msGetUserMedia);

var javascriptNode = null;
var microphone;
var aCtx;
var analyser;
var microphone;
var startButton = document.getElementById('start-button');

var timeStart = 0;
var currentTime = 0;
var maxTime = 10 // max time of recording 

var startMicrophone = function () {
	if (navigator.getUserMedia) {
		// successCallback
	    navigator.getUserMedia({audio: true}, function(stream) {
			startButton.innerHTML = '<h3>Nice!</h3>';
			timeStart = Date.now();

	        aCtx = new webkitAudioContext();

	        // setup a javascript node
	        javascriptNode = aCtx.createScriptProcessor(2048, 1, 1);
	        // connect to destination, else it isn't called
	        javascriptNode.connect(aCtx.destination);

	        analyser = aCtx.createAnalyser();
	        analyser.smoothingTimeConstant = 0.3;
	        analyser.fftSize = 1024;

	        microphone = aCtx.createMediaStreamSource(stream);
	        microphone.connect(analyser);
	        analyser.connect(aCtx.destination);

	        // we use the javascript node to draw at a specific interval.
	        analyser.connect(javascriptNode);

			javascriptNode.onaudioprocess = function() {
			    // get the average, bincount is fftsize / 2
			    var array =  new Uint8Array(analyser.frequencyBinCount);
			    analyser.getByteFrequencyData(array);
			    var average = getAverageVolume(array);

			    // ctx.clearRect(0, 0, canvas.width, canvas.height);

			    if ( average > 1.0 ) {
				    Circle.centerX = Math.random() * canvas.width;
				    Circle.centerY = Math.random() * canvas.height;
				    Circle.color = assignColor(average);
				    Circle.draw(average/2);
			    }

			    currentTime = Date.now();
			    if ( (currentTime - timeStart) / 1000 >= maxTime ) {
			    	startButton.innerHTML = '<h3>Click to Start!</h3>';
			    	analyser.disconnect(javascriptNode);
			    	javascriptNode.disconnect(aCtx.destination);

			    	finishRecording();
			    }
			}
	    },

	    // errorCallback
		  function(err) {
		  	startButton.innerHTML = '<h3>Error!</h3>';
		     console.log("The following error occured: " + err);
		  });
	};
}

var finishRecording = function () {
	// save canvas image as data url (png format by default)
    var dataURL = canvas.toDataURL();

    $.ajax({
	  type: "POST",
	  url: "saveImage.php",
	  data: { 
	     imgBase64: dataURL
	  }
	}).done(function(o) {
	  console.log('saved'); 
	  // If you want the file to be visible in the browser 
	  // - please modify the callback in javascript. All you
	  // need is to return the url to the file, you just saved 
	  // and than put the image in your browser.
	});
}

var assignColor = function (average) {
	if ( average <= 10.0 ) {
		return '#202026';
	}
	else if ( average > 10.0 && average <= 25.0 ) {
		return '#86A68E';
	}
	else if ( average > 25.0 && average <= 40.0 ) {
		return '#D9C99A';
	}
	else if ( average > 40.0 && average <= 60.0 ) {
		return '#F2CB57';
	}
	else if ( average > 60.0 ) {
		return '#D9A78B';
	}
}

startButton.addEventListener('click', function() {
	if ( javascriptNode === null ) {
		startMicrophone();
		startButton.innerHTML = '<h3>Allow Access</h3>';
	}
});


