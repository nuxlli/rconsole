module.exports.init = function(app) {
    var io = require('socket.io').listen(app);
    io.configure(function () { 
      io.set("transports", ["xhr-polling", "jsonp-polling"]);
      io.set("polling duration", 10);
    });
}