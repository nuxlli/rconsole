/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {
    
    var gcli  = require('gcli/index');
    var now   = require('nowjs');
    var $     = require('zepto');
    var basic = require('rconsole/commands/basic');

    /**
     * Registration and de-registration.
     */
    exports.startup = function() {
        gcli.addCommand(evalCommand);
    };

    exports.shutdown = function() {
        gcli.removeCommand(evalCommand);
    };
    
    /**
     * 'eval' command
     */
    var evalCommand = {
        name: '>',
        params: [{
            name: 'javascript',
            type: 'string',
            description: ''
        }],
        returnType: 'html',
        description: { root: 'Enter JavaScript to remote execution' },
        exec: function(args, context) {
            var promise = context.createPromise();
            
            // &#x2192; is right arrow. We use explicit entities to ensure XML validity
            var resultPrefix = '<em>{ ' + args.javascript + ' }</em> &#x2192; ';
            basic.sendMsg("eval", "(function() { return " + args.javascript + "})();" , function(type, result) {
                if (type == "ok") {
                    if (result === null) {
                        result = 'null.';
                    } else if(result === undefined) {
                        result = 'undefined.';
                    } else if(typeof result == "object") {
                        result = basic.shJS(JSON.stringify(result));
                    }
                    
                    promise.resolve(resultPrefix + result);
                } else {
                    promise.reject(resultPrefix + 'Exception: ' + result.message);
                }
            });
            return promise;
        }
    };
});