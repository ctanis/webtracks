var express = require('express');
var app = express();
var trax = {};
var stylus = require('stylus')
var nib = require('nib')

if (app.get('env') == 'development') {
    console.log("running with browser-sync: " + app.get('env'));
    var browserSync = require('browser-sync');
    var bs = browserSync({
        files: [ 'public/**/*.js', 'views/**/*.jade', 'stylesheets/**/*.styl' ],
        browser: ['google chrome']
    });
    app.use(require('connect-browser-sync')(bs));
}

app.set('views', './views');
app.set('view engine', 'jade');

app.use(stylus.middleware({
    src: __dirname + '/stylesheets',
    dest: __dirname + '/public/stylesheets',
    compile: function (str, path) {
        return stylus(str).set('filename', path).use(nib())
    }
}))

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index')
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

var client_no=0;

http.listen(3000, function() {
    console.log('listening on *:3000');
})


io.on('connection', function(socket) {

    console.log('new connection');
    socket.broadcast.emit('log', 'a user connected');

    socket.emit('hi', client_no++);


    for (var t in trax)
    {
        socket.emit('addTrack', trax[t]);
    }


    socket.on('addTrack', function(msg) {
        console.log('adding track ' + msg.id + " -- " + msg.track.name + " -- " + msg.track.data.length);

        socket.broadcast.emit('addTrack', msg);

        trax[msg.id]=msg;
    });

    socket.on('removeTrack', function(track_id) {
        console.log('removing track ' + track_id);
        delete trax[track_id];
        socket.broadcast.emit('removeTrack', track_id);
    });


    socket.on('updateTrack', function(msg) {
        console.log('updating track ' + msg.id);
        var track = trax[msg.id];
        track.name = msg.track.name;
        track.time_start = msg.track.time_start;
        track.sample_start = msg.track.sample_start;
        track.sample_end = msg.track.sample_end;
        socket.broadcast.emit('updateTrack', msg);
    });



});

