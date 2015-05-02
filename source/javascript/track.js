// a single track

var audio;                      // main audio
var micinput;                   // mic input node
var recorder;                   // mic recorder
var micmonitor;                 
var globalChunkSize=256;        //power of 2 >= 256
var tracks=[];
var master;

function go() {
    console.log("audio start");

    audio = new (window.AudioContext || window.webkitAudioContext)();
    master = audio.destination;
    enableMic();
}


function BufferStreamer(buffer, chunksize, output)
{
    this.buffer = buffer;
    this.chunksize = chunksize;
    this.pos = 0;
    this.output = output;
    this.processor = audio.createScriptProcessor(this.chunksize, 1, 1);
    this.processor.connect(output);
    this.processor.onaudioprocess = this.onprocess.bind(this);

    this.play = function(t) {
        this.pos = t;
        this.playing=true;
  
    };

    this.stop = function() {
        this.playing=false;

    };

    this.disconnect = function() {
        this.output=null;
        this.processor=null;        
    };

}


BufferStreamer.prototype.onprocess = function(e) {

    var out = e.outputBuffer.getChannelData(0);

    if (this.playing)
    {

        for (var i=0; i<this.chunksize; i++)
        {
            if (i+this.pos < this.buffer.length)
            {
                out[i] = this.buffer[i+this.pos];
            }
            else
            {
                out[i]=0;                    
            }
        }

        this.pos += this.chunksize;
    }
    else
    {
        for (var i=0; i<this.chunksize; i++)
        {
            out[i]=0;
        }
    }

};




function AudioTrack() {

    this.name           = "New"; //channel name
    this.buffer         = null;
    this.stream         = null;
    this.time_start     = 0;
    this.sample_start   = 0;
    this.sample_end     = 0;

    this.gainNode = audio.createGain();
    this.gainNode.connect(master);

    this.setBuffer = function(buffer) {
        this.buffer = buffer;
        this.stream = new BufferStreamer(this.buffer, globalChunkSize, this.gainNode);
        this.sample_start=0;
        this.sample_end=this.buffer.length;
    };


    this.play = function(sample) {

        if (sample >= this.time_start &&
            sample < this.time_start + (this.sample_end-this.sample_start))
        {
            console.log("playing " + this.name + " from sample " + sample );
            this.stream.play(sample-this.time_start);
            
        }
    };

    this.stop = function() {
        this.stream.stop();
    };


    this.draw = function(canvas) {
        canvas.height=200;      //fix me
        canvas.width=600;
        var delta = this.buffer.length / 600;

        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(0, 100);

        var c=0;

        for (var i=0; i<600; i++)
        {
            var sample = this.buffer[parseInt(i*delta)];
            ctx.lineTo(i,(sample+1)*100);
        }

        ctx.lineTo(600, 100);

        ctx.strokeStyle = '#ddd';
        ctx.fillStyle = '#f22';
        ctx.fill();
    };

}


function enableMic()  {
    
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (typeof navigator.getUserMedia != 'undefined') {
        navigator.getUserMedia({audio:true}, function(stream) {
            micinput = audio.createMediaStreamSource(stream);
            
            if (micinput) {
                recorder = new Recorder(micinput,
                                        {
                                            workerPath: "/bower_components/Recorderjs/recorderWorker.js",
                                            bufferLen: 256,
                                            numChannels:1
                                        });
            }
            console.log("got mic input");
//            micmonitor = new Monitor(micinput, document.getElementById("monitor"));


        }, function(e) {
            console.log("error: no live audio input! " + e);
        });
    }
}


function Monitor(device, elt) {

    this.analyser = audio.createAnalyser();
    this.canvas=elt;
    this.ctx2d = this.canvas.getContext("2d");
    this.ctx2d.lineWidth=1;
    
    this.analyser.fftSize = 2048;

    this.canvas.width=this.analyser.frequencyBinCount;
    this.buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.canvas.height=600;

    device.connect(this.analyser);
    this.analyser.connect(audio.destination);
    this.keepDrawing=1;

    this.draw = function() {

        if (this.keepDrawing) {
            requestAnimationFrame(this.draw.bind(this));
        }
        //        this.analyser.getByteFrequencyData(this.buffer);
        this.analyser.getByteTimeDomainData(this.buffer);

        this.clear();
        var ctx = this.ctx2d;

        ctx.beginPath();
        ctx.moveTo(0, 600);

        var min=999;
        var max=-999;
        for (var i=0; i<this.buffer.length; i++)
        {
            ctx.lineTo(i, 600 - (this.buffer[i]/255 * 600));
        }
        ctx.lineTo(this.buffer.length, 600);

        ctx.strokeStyle = '#ddd';
        ctx.fillStyle = '#f22';
        ctx.fill();
    };

    this.clear = function() {
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

}


function holdRecorded(buff) {
    
    var track = new AudioTrack();
    track.setBuffer(buff[0]);
    var canvas = document.createElement('canvas');
    canvas.id="track"+tracks.length;
    track.draw(canvas);
    tracks.push(track);
    recorder.clear();
    document.body.appendChild(canvas);
}

function recordNew() {
    recorder.record();
}

function recordStop() {
    recorder.stop();
    recorder.getBuffer(holdRecorded);
}

function play() {
    for (var i in tracks) {
        tracks[i].play(0);
    }
}

function stop() {
    for (var i in tracks) {
        tracks[i].stop();
    }
}
