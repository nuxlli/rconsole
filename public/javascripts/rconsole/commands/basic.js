/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {
    
    var gcli = require('gcli/index');
    var now  = require('nowjs');
    var $    = require('zepto');

    /**
     * Registration and de-registration.
     */
    exports.startup = function() {
        gcli.addCommand(listen);
        gcli.addCommand(clear);
        // gcli.addCommand(load);
        // gcli.addCommand(refresh);
    };

    exports.shutdown = function() {
        gcli.removeCommand(listen);
        gcli.removeCommand(clear);
        // gcli.removeCommand(load);
        // gcli.removeCommand(refresh);
    };
    
    var clear  = {
        name: "clear",
        description: {
            'root': 'Clear output console'
        },
        exec: function(args, context) {
            setTimeout(function() {
                output_elem().html("");
            }, 100);
        }
    }

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
                
                promise.resolve(instructions);
            });
            
            return promise;
        }
    }
    
    function output(output) {
        output_elem().append('\
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
    
    var gco_element = null;
    function output_elem() {
        if (gco_element == null)
            gco_element = $('.gcliCommandOutput');
        return gco_element;
    }
    
    exports.shJS   = shJS;
    exports.shHtml = shHtml;
    exports.output = output;
});
