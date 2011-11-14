var uuid = require('node-uuid');

module.exports.init = function(app) {
    var nowjs    = require("now");
    var everyone = nowjs.initialize(app, {socketio: {transports: ['xhr-polling', 'jsonp-polling']}});
    
    // TODO: move to this check remote client is connected
    everyone.now.sendMsg = function(type, data, fn) {
        if (typeof this.now.identify != "undefined") {
            var prefix = this.now.identify.type == "client" ? "server:" : "client:";
            var group  = nowjs.getGroup(prefix + this.now.identify.id)
            if (group != null)
                group.now.receiveMsg(type, data, fn);
        }
    }
    
    function initObjectByType(obj, id, type, fn) {
        var identify = { type: type, id: id };
        var group    = nowjs.getGroup(type + ":" + identify.id)
        group.addUser(obj.user.clientId);
        fn(obj.now.identify = identify);
    }
    
    function sendMsgServer(client, msg) {
        var identify = client.now.identify;
        if (typeof identify != 'undefined' && identify.type == "client") {
            var id    = identify.id;
            var group = nowjs.getGroup("server:" + id);
            if (group != null)
                group.now.receiveMsg(msg, id);
        }
    }
    
    everyone.now.initServer = function(id, fn) {
        id = (id == null ? uuid() : id);
        initObjectByType(this, id, "server", fn);
    };
    
    everyone.now.initClient = function(id, fn) {
        initObjectByType(this, id, "client", fn);
        sendMsgServer(this, "connected");
    }
    
    nowjs.on("disconnect", function() {
        sendMsgServer(this, "disconnected");
    });
}