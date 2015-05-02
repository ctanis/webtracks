// a single track

var wt;

var audio;                      // main audio
var globalChunkSize=256;        //power of 2 >= 256

var micinput;                   // mic input node
var recorder;                   // mic recorder
var micmonitor;                 

var master;                     // output gain node


function track_init() {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    wt = new WebTrax();

    master = audio.createGain();
    master.connect(audio.destination);

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
        // send 0's
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



function holdRecorded(buff) {
    
    var track = new AudioTrack();
    console.log(typeof buff);
    console.log(buff);
    track.setBuffer(buff[0]);
    recorder.clear();
    wt.addTrack(track);
}

function recordNew() {
    recorder.record();
}

function recordStop() {
    recorder.stop();
    recorder.getBuffer(holdRecorded);
}



function WebTrax() {
    this.trax = {};
    this.socket = io();
    this.trackno=0;
    this.pos=0;

    this.socket.on('hi', function(msg) {
        this.client_id = msg;
        console.log("client registered as " + this.client_id);
    }.bind(this));

    this.socket.on('addTrack', function(msg) {
        console.log('receiving track ' + msg.id + " -- " + msg.track.name);

        var track = wt.parseTrackBlob(msg);
        this.addTrack(track, msg.id);
    }.bind(this));


}

WebTrax.prototype.play = function() {
    for (var i in this.trax) {
        this.trax[i].play(this.pos);
    }    
};


WebTrax.prototype.stop = function() {
    for (var i in this.trax) {
        this.trax[i].stop();
    }    
};



WebTrax.prototype.addTrack = function(track, track_id)
{
    if (!track_id)
    {
        track_id = this.client_id + '-' + this.trackno;
        this.trackno++;

        // remote track sync(track, track_id)        
        this.socket.emit('addTrack', { id: track_id,
                                       track: this.packBlob(track) });
    }
    
    console.log("new track with id "  + track_id);
    this.trax[track_id]=track;

    // replace with UI callback?
    var canvas = document.createElement('canvas');
    canvas.id="track"+this.trax.length;
    track.draw(canvas);
    document.body.appendChild(canvas);
};


WebTrax.prototype.removeTrack = function(track_id)
{
    delete this.trax[track_id];

    this.socket.emit('removeTrack', track_id);
}



WebTrax.prototype.parseTrackBlob = function(blob) {

    // console.log("parsing");
    // console.log(blob);

    var id = blob.id;
    var tdata = blob.track;

    var track = new AudioTrack();

    track.name = tdata.name;
    track.time_start = tdata.time_start;
    track.sample_start = tdata.sample_start;
    track.sample_end = tdata.sample_end;

    var buffer = new Float32Array(tdata.data);
    track.setBuffer(buffer);

    // track.gainNode.set(tdata.gain)

    return track;
};

WebTrax.prototype.packBlob = function(track) {
    var blob= {
        name: track.name,
        time_start: track.time_start,
        sample_start: track.sample_start,
        sample_end: track.sample_end,

        // yes, this has to be buffer.buffer
        data: track.buffer.buffer
    };

    // console.log('packing');
    // console.log(blob);
    return blob;
    
};

