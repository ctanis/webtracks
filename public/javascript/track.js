// a single track

var wt;

var audio;                      // main audio

var globalChunkSize=256;        //power of 2 >= 256
var waveFormScale=500;

var micinput;                   // mic input node
var recorder;                   // mic recorder
var micmonitor;                 

var master;                     // output gain node
var masterGain;
var masterEcho;

var lastRecording;

function track_init(ui) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    wt = new WebTrax(ui);

    master = audio.createGain();
    masterGain = audio.createGain();
    masterEcho = new AudioEcho(masterGain);
    master.connect(masterGain);
    masterGain.connect(audio.destination);

    enableMic();

    socket = io();

    if (typeof socket == 'undefined')
    {
        console.log('no websocket');
        socket = null;
    }
}



function BufferStreamer(buffer, chunksize, output)
{
    this.buffer = buffer;
    this.chunksize = chunksize;
    this.pos = 0;
    this.output = output;
    this.processor = audio.createScriptProcessor(this.chunksize, 1, 1);
    this.processor.connect(output.gainNode);
    this.processor.connect(output.echoGain);
    this.processor.onaudioprocess = this.onprocess.bind(this);

    this.play = function(t, len) {
        this.max = len;
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
        if (typeof this.max === 'number')
        {
            var percentage = this.pos / this.max;
            
            if (percentage <= 1) {
                // console.log('setting ui pos to ' + this.pos/this.max);
                // update pos
                ui.updateNeedle(this.pos / this.max);
            }
        }
    }
    else
    {
        // send 0's
        for (var i=0; i<this.chunksize; i++)
        {
            out[i]=0;
        }
    }

};




function AudioTrack(trackName) {

    this.name           = trackName || null; //channel name
    this.buffer         = null;
    this.stream         = null;
    this.time_start     = 0;
    this.sample_start   = 0;
    this.sample_end     = 0;
    this.gain           = 1;
    this.echo           = 0;

    this.gainNode = audio.createGain();
    this.gainNode.connect(master);

    this.echoGain = audio.createGain();
    this.echoGain.connect(masterEcho.in);
    this.echoGain.gain.value=this.echo;


    this.setVolume = function(g) {
        this.gain =g;
        this.gainNode.gain.value=this.gain;
    };

    this.getVolume = function() {
        return this.gainNode.gain.value;j
    };


    this.setSend = function(g) {
        this.echo =g;
        this.echoGain.gain.value=this.echo;
    };

    this.getSend = function() {
        return this.echoGain.gain.value;
    };




    this.setBuffer = function(buffer) {

        this.buffer = buffer;
        this.stream = new BufferStreamer(this.buffer, globalChunkSize, this);
        this.sample_start=0;
        this.sample_end=this.buffer.length;
    };


    this.length = function() {
        return this.sample_end - this.sample_start;
    };


    this.play = function(sample, poslength) {

        // put this back if we ever add clip translation and cropping
        // if (sample >= this.time_start &&
        //     sample < this.time_start + (this.sample_end-this.sample_start))
        console.log("playing " + this.name + " from sample " + sample );

        if (poslength) {
            this.stream.play(sample-this.time_start, poslength);
        }
        else
        {
            this.stream.play(sample-this.time_start);
        }
    };

    this.stop = function() {
        this.stream.stop();
    };


    this.draw = function(canvas, length) {
        this.canvas = canvas;

        canvas.height=144;      //fix me
        canvas.width=1000;

        var delta=length/canvas.width;
        var actual = this.buffer.length;

        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(0, 72);

        var c=0;

        for (var i=0; i<canvas.width; i++)
        {
            var p = parseInt(i*delta);

            if (p <= actual)
            {
                sample = this.buffer[p];
            }
            else
            {
                sample = 0;
            }

            ctx.lineTo(i,(sample+1)*72);
        }


        ctx.lineTo(canvas.width, 72);

        // waveform colors
        ctx.strokeStyle = '#ddd';
        ctx.fillStyle = '#333';
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



function commitRecorded(recordingName) {
    lastRecording.name = recordingName;
    wt.addTrack(lastRecording);
    wt.ui.resetRecorder();
}

function recordNew() {
    wt.stop();
    wt.play();
    recorder.record();
}

function recordStop(callback) {
    recorder.stop();
    recorder.getBuffer(function (buff) {
        var track = new AudioTrack();
        // console.log(typeof buff);
        // console.log(buff);
        track.setBuffer(buff[0]);
        recorder.clear();
        lastRecording = track;
        if (typeof callback == 'function') {
            callback();
        }
    });
}



function WebTrax(ui) {
    this.trax = {};
    this.socket = io();
    this.trackno=0;
    this.pos=0;
    this.ui = ui;
    this.longest=0;

    this.socket.on('hi', function(msg) {
        this.client_id = msg;
        console.log("client registered as " + this.client_id);
    }.bind(this));

    this.socket.on('addTrack', function(msg) {
        console.log('receiving track ' + msg.id + " -- " + msg.track.name);

        // parse with body
        var track = wt.parseTrackBlob(msg, false);
        this.addTrack(track, msg.id);
    }.bind(this));

    this.socket.on('removeTrack', function(track_id) {
        console.log('removing track ' + track_id);
        this.removeTrack(track_id, true);
    }.bind(this));

    this.socket.on('updateTrack', function(msg) {
        var track = this.trax[msg.id];
        track.name = msg.track.name;
        track.time_start = msg.track.time_start;
        track.sample_start = msg.track.sample_start;
        track.sample_end = msg.track.sample_end;
        track.setVolume(msg.track.gain);
    }.bind(this));

}

WebTrax.prototype.play = function(pct) {
    var go=true;                // first track updates pointer position
    var start = 0;

    if (typeof pct === 'number')
    {
        start = parseInt(pct * this.longest);
    }
    else
    {
        start = 0;
    }

    for (var i in this.trax) {

        if (go)
        {
            this.trax[i].play(start, this.longest);
        }
        else
        {
            this.trax[i].play(start);
        }
        go=false;
    }    
};


WebTrax.prototype.stop = function() {
    for (var i in this.trax) {
        this.trax[i].stop();
    }    
};

WebTrax.prototype.masterVolume = function(v) {
    masterGain.gain.value = v;
}



WebTrax.prototype.addTrack = function(track, track_id)
{

    if (!track_id)
    {
        track_id = this.client_id + '-' + this.trackno;
        this.trackno++;

        // remote track sync(track, track_id)        
        this.socket.emit('addTrack', { id: track_id,
                                       track: this.packTrackBlob(track, false) });
    }

    track.id = track_id;
    console.log("new track with id "  + track_id);

    if (track.buffer.length > this.longest){
        this.longest = track.buffer.length;
        console.log("new longest track: " + this.longest);

        // redraw other tracks
        for (var t in this.trax) {
            this.trax[t].draw(document.getElementById('wf'+t), this.longest);
        }
    }


    this.trax[track_id]=track;

    // replace with UI callback?
    var canvas = document.createElement('canvas');
    canvas.id='wf'+track_id;
    canvas.className='trackwf';
    track.draw(canvas, this.longest);
    // document.body.appendChild(canvas);
    if (!track.name) { track.name = 'Track ' + track_id }
    if (typeof this.ui.loadNewTrack == 'function') {
        this.ui.loadNewTrack(track);
    }
};



WebTrax.prototype.removeTrack = function(track_id, remote)
{
    delete this.trax[track_id];

    if (! remote)
    {
        this.socket.emit('removeTrack', track_id);
    }

    this.ui.removeTrackFromUI(track_id);
}

WebTrax.prototype.updateTrack = function(track_id)
{
    var track=this.trax[track_id];

    // pack header only
    this.socket.emit('updateTrack', {id: track_id,
                                     track: this.packTrackBlob(track, true)});
}



WebTrax.prototype.parseTrackBlob = function(blob, header) {

    // console.log("parsing");
    // console.log(blob);

    var id = blob.id;
    var tdata = blob.track;

    var track = new AudioTrack();

    track.name = tdata.name;
    track.time_start = tdata.time_start;
    track.sample_start = tdata.sample_start;
    track.sample_end = tdata.sample_end;
    track.setVolume(tdata.gain);

    if (!header)
    {
        var buffer = new Float32Array(tdata.data);
        track.setBuffer(buffer);
    }


    return track;
};

WebTrax.prototype.packTrackBlob = function(track, header) {
    var blob= {
        name: track.name,
        time_start: track.time_start,
        sample_start: track.sample_start,
        sample_end: track.sample_end,
        gain: track.gain
    };

    if (!header)
    {
        // yes, this has to be buffer.buffer
        blob.data = track.buffer.buffer;
    }

    // console.log('packing');
    // console.log(blob);
    return blob;
    
};



function AudioEcho(out) {
    this.feedBack=0;
    this.time=1000;
    this.gain=0;

    this.in = audio.createDelay(1);
    this.fbgain = audio.createGain();
    this.echoGain = audio.createGain();

    this.in.connect(this.fbgain);
    this.fbgain.connect(this.in);
    this.in.connect(this.echoGain);
    this.echoGain.connect(out);

    this.setDelay = function(d) {
        this.time = d;
        this.in.delayTime.value=d;
    };

    this.setFeedback = function(f) {
        this.feedBack = f;
        this.fbgain.gain.value=f;
    };

    this.setVolume = function(v) {
        this.gain=v;
        this.echoGain.gain.value=v;
    }

    
    this.setDelay(1);
    this.setFeedback(0);
    this.setVolume(0);
}

