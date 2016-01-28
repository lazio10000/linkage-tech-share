// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
// Setup mongodb client
var mongoClient = require('mongodb').MongoClient;
var mongoHost = process.env.MONGODB_PORT_27017_TCP_ADDR || 'localhost';
var mongoPort = process.env.MONGODB_PORT_27017_TCP_PORT || 27017;
var mongoDatabase = process.env.MONGODB_INSTANCE_NAME || 'test';
var mongoUsername = process.env.MONGODB_USERNAME;
var mongoPassword = process.env.MONGODB_PASSWORD;
var mongoUrl = "tcp://" + mongoUsername + ":" + mongoPassword + "@" + mongoHost + ":" + mongoPort.toString() + "/" + mongoDatabase;
console.log(mongoUrl);

server.listen(3000, function () {
    console.log('Server listening at port %d', 3000);
});

// Routing
app.use(express.static(__dirname + '/public'));
var usernames = {};
var numUsers = 0;

var insertData = function (winnerList) {  
    var lotteryDate = new Date();
    var data = [];
    winnerList.forEach(function (winner) {
        data.push({ "LotteryPeriod": lotteryDate, "Winner": winner });
    }); 
    //插入数据  
    mongoClient.connect(mongoUrl, function (err, db) { 
        var collection = db.collection('WinnerList');
        collection.insert(data, function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            db.close();
        }); 
    }); 
}

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('', function (data) {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    socket.on('lottery', function (data) {
        insertData(data);
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
