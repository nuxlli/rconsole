var uuid = require('node-uuid');

module.exports.init = function(app) {
    var io = require('socket.io').listen(app);
    io.configure(function () { 
      io.set("transports", ["xhr-polling", "jsonp-polling"]);
      io.set("polling duration", 10);
    });
    
    // Log wherever connection
    io.sockets.on('connection', function (socket) {
        socket.on("listen", function(id, fn) {
            if (id == null)
                id = uuid();
            fn( { id: id });
        });
    });
}