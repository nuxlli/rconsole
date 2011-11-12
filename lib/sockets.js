var uuid = require('node-uuid');

module.exports.init = function(app) {
    var io = require('socket.io').listen(app);
    io.configure(function () { 
      io.set("transports", ["xhr-polling", "jsonp-polling"]);
      io.set("polling duration", 10);
    });
    
    // Log wherever connection
    io.sockets.on('connection', function (socket) {
        socket.on("speak", function(id, fn) {
            socket.set("identify", id, function() {
                fn({ id: id });
            });
            
            socket.on("msg", function(msg, fn) {
                io.sockets.emit("from:" + id, msg, fn);
            });
        });
        
        socket.on("listen", function(id, fn) {
            if (id == null)
                id = uuid();
            
            socket.set("identify", id, function() {
                fn({ id: id });
            });
            
            socket.on("msg", function(msg, fn) {
                io.sockets.emit("to:" + id, msg, fn);
            });
        });
    });
}