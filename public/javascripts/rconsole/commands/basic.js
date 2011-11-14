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
        gcli.addCommand(load);
        gcli.addCommand(loadUrl);
        gcli.addCommand(loadLib);
        gcli.addCommand(refresh);
    };

    exports.shutdown = function() {
        gcli.removeCommand(listen);
        gcli.removeCommand(clear);
        gcli.removeCommand(load);
        gcli.removeCommand(loadUrl);
        gcli.removeCommand(loadLib);
        gcli.removeCommand(refresh);
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
    
    var refresh = {
        name: "refresh",
        description: {
            'root': "Refresh remote page"
        },
        exec: function(args, context) {
            var promise = context.createPromise();
            
            sendMsg("refresh", null, function(type, result) {
                if (type == "ok") {
                    promise.resolve("Refresh in progress, wait!");
                } else {
                    promise.reject("Refresh is not possible, error: " + result.message);
                }
            });
            
            return promise;
        }
    }
    
    var load  = {
        name: "load",
        description: {
            'root': "Inject external libraries"
        }
    };
    
    var loadFunc = function(args, context) {
        var promise = context.createPromise();
        
        sendMsg("load", args.url, function(type, result) {
            var prefix = "<em>" + args.url + "</em> &#x2192;"
            if (type == "ok") {
                promise.resolve(prefix + " loaded");
            } else {
                promise.reject(prefix + " Exception: " + result.message);
            }
        });
        
        return promise;
    }
    
    var loadUrl  = {
        name: "load url",
        description: {
            'root': "Inject specifies javascript url"
        },
        params: [{
            name: "url",
            type: "string",
            description: {
                root: "javascript url"
            }
        }],
        exec: loadFunc
    }
    
    var loadLib  = {
        name: "load lib",
        description: {
            'root': "Inject a predefined lib"
        },
        params: [{
            name: "url",
            type: {
                name: 'selection',
                lookup: [
                    { name: "jquery"       , value: "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" },
                    { name: "zepto"        , value: "https://raw.github.com/nuxlli/rconsole/master/public/javascripts/zepto.min.js" },
                    { name: "underscore"   , value: "http://documentcloud.github.com/underscore/underscore-min.js" },
                    { name: "mootools"     , value: "http://ajax.googleapis.com/ajax/libs/mootools/1/mootools-yui-compressed.js" },
                    { name: "dojo"         , value: "http://ajax.googleapis.com/ajax/libs/dojo/1/dojo/dojo.xd.js" },
                    { name: "rightjs"      , value: "http://rightjs.org/hotlink/right.js" },
                    { name: "coffeescript" , value: "http://jashkenas.github.com/coffee-script/extras/coffee-script.js" },
                    { name: "yui"          , value: "http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js" },
                ]
            },
            description: {
                root: "lib"
            }
        }],
        exec: loadFunc
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
                // console.log(arguments);
                
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
                case "connected":
                    output("Client id:<strong>" + data + "</strong> has <span class='connected'>connected</span>");
                    break;
                case "disconnected":
                    output("Client id:<strong>" + data + "</strong> <span class='disconnected'>disconnected</span>", 'gcliComplete gcliError');
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
    
    function output(output, klass) {
        if (typeof klass == 'undefined')
            klass = 'gcliComplete'
        
        output_elem().append('\
            <div class="gcliRowIn">\
              <!-- What the user actually typed -->\
              <span class="gcliGt ' + klass + '">&#x00BB;</span>\
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
    
    function sendMsg() {
        var args = arguments;
        var showError = function(error) {
            if (typeof args[args.length - 1] == "function")
                (args[args.length - 1])("error", { message: error });
            else
                output(error, 'gcliComplete gcliError');
        }
        
        if (typeof now.identify == "object") {
            var executed = false;
            now.sendMsg("ping", {}, function(result) {
                if ((!executed) && result == "ok") {
                    now.sendMsg.apply(now, args);
                    executed = true;
                }
            });
            setTimeout(function() {
                if (!executed) {
                    executed = true;
                    showError("Timeout to run remote call exceeded, check the connection.");
                }
            }, 5000);
        } else
            showError("You must call listen before remote calls");
    }
    
    exports.shJS    = shJS;
    exports.shHtml  = shHtml;
    exports.output  = output;
    exports.sendMsg = sendMsg;
});
