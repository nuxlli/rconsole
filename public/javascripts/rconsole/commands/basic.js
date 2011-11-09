/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {
    
    var gcli    = require('gcli/index');
    var io      = require('socket.io');
    var connect = null;

    /**
     * Registration and de-registration.
     */
    exports.startup = function() {
        gcli.addCommand(listen);
        // gcli.addCommand(load);
        // gcli.addCommand(clear);
        // gcli.addCommand(about);
        // gcli.addCommand(refresh);
    };

    exports.shutdown = function() {
        gcli.removeCommand(listen);
    };

    var listen = {
        name: 'listen',
        description: {
            'root': 'Listen for remote console'
        },
        params: [{
            name: "id",
            type: "string",
            description: {
                root: "id for listen old connection"
            },
            defaultValue: null
        }],
        exec: function(args, context) {
            var promise = context.createPromise();
            
            getConnect().emit("listen", args.id, function(info) {
                console.log(info);
                var instructions = 'script id="rconsole" src="' + window.location.href + '/remote.js?' + info.id + '"'
                promise.resolve(instructions);
            });
            
            return promise;
        }
    }
    
    function getConnect() {
        if (connect == null) {
            connect = io.connect("http://" + window.location.hostname, { port: window.location.port });
        }
        return connect;
    }

});
