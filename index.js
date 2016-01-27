// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000; 

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public')); 
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
	var addedUser = false;
	 
	socket.on('', function (data) { 
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});
	});
	
	socket.on('lottery', function (data) {   
		socket.broadcast.emit('lottery', { 
			message: data.toString()
		});
	});
	 
	socket.on('add user', function (username) { 
		socket.username = username; 
		if (!usernames[username]) {
			usernames[username] = username;
			++numUsers;
			addedUser = true;
			socket.emit('login', {
				numUsers: numUsers
			}); 
			socket.broadcast.emit('user joined', {
				username: socket.username,
				numUsers: numUsers
			});
		} else {
			socket.emit('loginError', {});
		} 
	});
	   
	socket.on('disconnect', function () { 
		if (addedUser) {
			delete usernames[socket.username];
			--numUsers; 
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});
	 
});
