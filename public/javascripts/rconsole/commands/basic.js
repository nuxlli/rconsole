/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {
    
    var gcli    = require('gcli/index');
    var now     = require('nowjs');
    // var connect = null;

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
            'root': 'Start remote debugging session'
        },
        params: [{
            name: "id",
            type: "string",
            description: {
                root: "id to connect old session"
            },
            defaultValue: null
        }],
        exec: function(args, context) {
            var promise = context.createPromise();
            var is_new  = (args.id == null);
            
            now.receiveMsg = function(type, data, fn) {
                if (fn == null)
                    fn = function() {};
                switch(type) {
                case "log":
                    fn(console.log.call(console, data));
                    break;
                case "ping":
                    now.sendMsg("pong");
                    fn();
                    break;
                }
                console.log("Msg", arguments);
            }
            
            now.initServer(args.id, function() {
                var instructions = 'Start remote debugging for session id: <strong>' + now.identify.id + '</strong>';
                
                if (is_new) {
                    instructions += "<br/>Add the following tag to the remote script:"
                    instructions += shHtml('<script id="rconsole"\n  src="' + window.location.href + 'rconsole.js?' + now.identify.id + '">\n</script>');
                }
                
                promise.resolve(instructions);
            });
            
            return promise;
        }
    }
    
    var htmlBrush = null
    function shHtml(html) {
        if (htmlBrush == null) {
            htmlBrush = new SyntaxHighlighter.brushes.Xml();
            htmlBrush.init({ toolbar: false })
        }
        return htmlBrush.getHtml(html);
    }
    
    function getConnect() {
        if (connect == null) {
            connect = io.connect("http://" + window.location.hostname, { port: window.location.port });
        }
        return connect;
    }

});
