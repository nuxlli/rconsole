/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {
    
    var gcli  = require('gcli/index');
    var now   = require('nowjs');
    var $     = require('zepto');

    /**
     * Registration and de-registration.
     */
    exports.startup = function() {
        gcli.addCommand(listen);
        // gcli.addCommand(eval);
        // gcli.addCommand(load);
        // gcli.addCommand(clear);
        // gcli.addCommand(about);
        // gcli.addCommand(refresh);
    };

    exports.shutdown = function() {
        gcli.removeCommand(listen);
        // gcli.removeCommand(eval);
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
                    // fn(console.log.call(console, data));
                    // fn(output(data));
                    fn(output(shJS(JSON.stringify.call(JSON, data))));
                    break;
                case "ping":
                    now.sendMsg("pong");
                    fn();
                    break;
                default:
                    console.log("Msg", arguments);
                }
            }
            
            now.initServer(args.id, function() {
                var instructions = 'Start remote debugging for session id: <strong>' + now.identify.id + '</strong>';
                
                if (is_new) {
                    instructions += "<br/>Add the following tag to the remote script:"
                    instructions += shHtml('<script id="rconsole"\n  src="' + window.location.href + 'rconsole.js?' + now.identify.id + '">\n</script>');
                }
                
                // now.sendMsg("eval", "alert('teste');");
                
                promise.resolve(instructions);
            });
            
            return promise;
        }
    }
    
    var gco_element = null;
    function output(output) {
        if (gco_element == null)
            gco_element = $('.gcliCommandOutput');
        
        gco_element.append('\
            <div class="gcliRowIn">\
              <!-- What the user actually typed -->\
              <span class="gcliGt gcliComplete">&#x00BB;</span>\
              <span class="gcliOutTyped">Log</span>\
              <!-- The extra details that appear on hover -->\
            </div>\
            \
            <!-- The div for the command output -->\
            <div class="gcliRowOut" aria-live="assertive">\
              <div class="gcliRowOutput">\
              <p>' + output + '</p>\
              </div>\
            </div>\
        ');
    }
    
    var htmlBrush = null;
    function shHtml(html) {
        if (htmlBrush == null) {
            htmlBrush = new SyntaxHighlighter.brushes.Xml();
            htmlBrush.init({ toolbar: false });
        }
        return htmlBrush.getHtml(html);
    }
    
    var jsBrush = null;
    function shJS(js) {
        if (jsBrush == null) {
            jsBrush = new SyntaxHighlighter.brushes.JScript();
            jsBrush.init({ toolbar: false });
        }
        return jsBrush.getHtml(js);
    }
});
