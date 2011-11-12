var uuid = require('node-uuid');

module.exports.init = function(app) {
    var nowjs    = require("now");
    var everyone = nowjs.initialize(app, {socketio: {transports: ['xhr-polling', 'jsonp-polling']}});
    
    everyone.now.sendMsg = function(type, data, fn) {
        var prefix = this.now.identify.type == "client" ? "server:" : "client:";
        nowjs
            .getGroup(prefix + this.now.identify.id)
            .now.receiveMsg(type, data, fn);
    }
    
    function initObjectByType(obj, id, type, fn) {
        var identify = { type: type, id: id };
        var group    = nowjs.getGroup(type + ":" + identify.id)
        group.addUser(obj.user.clientId);
        fn(obj.now.identify = identify);
    }
    
    everyone.now.initServer = function(id, fn) {
        id = (id == null ? uuid() : id);
        initObjectByType(this, id, "server", fn);
    };
    
    everyone.now.initClient = function(id, fn) {
        initObjectByType(this, id, "client", fn);
    }
}