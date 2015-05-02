var express = require('express');

var app = express();
var trax={};

app.use(express.static('public'));
app.use('/javascript', express.static('javascript'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

var client_no=0;

http.listen(8080, function() {
    console.log('listening on *:8080');
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

    // console.log('a user connected');

    // socket.on('disconnect', function() {
    //     console.log('a user disconnected');
    // });

    // socket.on('note', function(msg) {
    //     console.log('a drum note setting has arrived: ' +msg);
    //     // io.emit('drum', msg);
    //     socket.broadcast.emit('note', msg);
    // });

    // socket.on('sound', function(msg) {
    //     console.log('a new sound has arrived: ' +msg);
    //     // io.emit('drum', msg);
    //     socket.broadcast.emit('sound', msg);
    // });

    // socket.on('presound', function(msg) {
    //     console.log('load preset: ' +msg);
    //     // io.emit('drum', msg);
    //     socket.broadcast.emit('presound', msg);
    // });

    // socket.on('tempo', function(msg) {
    //     // console.log('tempo change: ' +msg);
    //     // io.emit('drum', msg);
    //     socket.broadcast.emit('tempo', msg);
    // });

    // socket.on('sync', function(msg) {
    //     console.log('sync');
    //     socket.broadcast.emit('sync');
    //     socket.emit('sync');
    // });



});

