/*
 * Copyright 2011 Éverton Antônio Ribeiro <nuxlli@gmail.com>.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

;(function() {
    var $ = function() {
        return document.getElementById.apply(document, arguments);
    }
    
    // Get host
    if (typeof $('rconsole') == 'undefined')
        return 1;

    var src  = $('rconsole').src;
    var id   = src.replace(/.*\?/, '');
    var host = 'http://' + src.substr(7).replace(/\/.*$/, '');
    var io   = null;
    
    var init = function(require) {
        var old_io = window.io;
        require(host + "/socket.io/socket.io.js", function() {
            // No conflict
            io = window.io;
            window.io = old_io;
        });
    }
    
    // 1 - Get host based in include script
    // 2 - Load socket.io lib from origem
    // 3 - Fixed socket.io to use xhr in raplace for iframe
    // 4 - Conect to socket.io and bind events
    // 5 - Fix then:
    //     - not console.log or mobile connect? Add or replace
    //     - is tv? replace alert for console.log
    // 6 - Adding tools methods: eval, refresh, load
    
    /**
     * Require external js
     */
     var head    = document.getElementsByTagName("head")[0];
     var require = function(srcs, callback, errcallback) {
         if (!isArray(srcs)) srcs = [srcs];

         var count = srcs.length;
         
         for(var i = 0; i < srcs.length; i++) {
             (function(src) {
                 var fail    = false;
                 var loaded  = false;
                 var script  = document.createElement("script");
                 script.type = "text/javascript";
                 script.src  = src;

                 setTimeout(function() {
                     if (!loaded) {
                         fail = true; errcallback();
                     }
                 }, 3000);

                 script.onload = function () {
                     if (!fail) {
                         loaded = true;
                         if ((count -= 1) == 0) callback();
                     }
                 }

                 head.appendChild(script);
             })(srcs[i]);
         }
     }
    
    /**
     * Returns `true` if an object is an array, `false` if it is not.
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
     *
     * Syntax: Array.isArray(object)
     */
    var isArray = function(subject) {
        return Object.prototype.toString.call(subject) == "[object Array]";
    }
    
    init(require);
})();
