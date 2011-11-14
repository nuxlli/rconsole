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

    var src    = $('rconsole').src;
    var id     = src.replace(/.*\?/, '');
    var host   = 'http://' + src.substr(7).replace(/\/.*$/, '');
    
    var init = function(require) {
        connect(function() {
            var sendResponse = function(type, status, data, fn) {
                (typeof fn == "function") ?
                    fn(status, data) : now.sendMsg(type, data);
            }
            
            now.receiveMsg = function(type, data, fn) {
                switch(type) {
                case "ping":
                    return sendResponse("pong", "ok", null, fn);
                case "eval":
                    try {
                        return sendResponse(type, "ok", eval(data), fn);
                    } catch(e) {
                        return sendResponse(type, "error", {
                            message: e.message
                        }, fn);
                    }
                case "load": 
                    return require(data, function() {
                        sendResponse(type, "ok", { message: "loaded" }, fn);
                    }, function() {
                        sendResponse(type, "error", { message: "timeout" } , fn);
                    });
                }
                console.log("Msg", arguments);
                if (typeof fn == "function")
                    return fn();
            }
            
            now.initClient(id, function() {
                now.sendMsg("log", "isso é uma teste", function() {
                    console.log("Retornou");
                });
                now.sendMsg("ping");
            });
        });
    }
    
    var socket = null;
    function connect(callback) {
        if (socket == null) {
            require([
                host + "/socket.io/socket.io.js",
                host + "/nowjs/now.js"
            ], function() {
                fixingSocket(io);
                
                now.ready(function() {
                    callback();
                });
            });
        } else {
            callback();
        }
    }
    
    // 1 - Get host based in include script
    // 2 - Load socket.io lib from origem
    // 3 - Fixed socket.io to use xhr in raplace for iframe
    // 4 - Conect to socket.io and bind events
    // 3 - Implement log, expand objects
    // 6 - Fix then:
    //     - not console.log or mobile connect? Add or replace
    //     - is tv? replace alert for console.log
    // 7 - Adding tools methods: eval, refresh, load
    
    // Fixed socket.io request
    function fixingSocket(io) {
        // TODO: test, test, test
        io.Transport['jsonp-polling'].prototype.post = function(data) {
            var self  = this
              , query = io.util.query(
                     this.socket.options.query
                  , 't='+ (+new Date) + '&i=' + this.index
                );

            reqwest({
                url: this.prepareUrl() + query
              , method: 'post'
              , data: { d: data }
              , success: function (resp) {
                  self.socket.setBuffer(false);
                }
            });
            self.socket.setBuffer(true);
        };
    }
    
    /**
     * Require external js
     */
     var head = document.getElementsByTagName("head")[0];
     function require(srcs, callback, errcallback) {
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
     * Syntax: isArray(object)
     */
    function isArray(subject) {
        return Object.prototype.toString.call(subject) == "[object Array]";
    }
    
    /*!
      * Reqwest! A general purpose XHR connection manager
      * (c) Dustin Diaz 2011
      * https://github.com/ded/reqwest
      * license MIT
      */
    !function(a,b){typeof define=="function"?define(b):typeof module!="undefined"?module.exports=b():this[a]=b()}("reqwest",function(){function serializeHash(){var a={};eachFormElement.apply(function(b,c){b in a?(a[b]&&!isArray(a[b])&&(a[b]=[a[b]]),a[b].push(c)):a[b]=c},arguments);return a}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function eachFormElement(){var a=this,b,c,d,e=function(b,c){for(var e=0;e<c.length;e++){var f=b[byTag](c[e]);for(d=0;d<f.length;d++)serial(f[d],a)}};for(c=0;c<arguments.length;c++)b=arguments[c],/input|select|textarea/i.test(b.tagName)&&serial(b,a),e(b,["input","select","textarea"])}function serial(a,b){var c=a.name,d=a.tagName.toLowerCase(),e=function(a){a&&!a.disabled&&b(c,normalize(a.attributes.value&&a.attributes.value.specified?a.value:a.text))};if(!a.disabled&&!!c)switch(d){case"input":if(!/reset|button|image|file/i.test(a.type)){var f=/checkbox/i.test(a.type),g=/radio/i.test(a.type),h=a.value;(!f&&!g||a.checked)&&b(c,normalize(f&&h===""?"on":h))}break;case"textarea":b(c,normalize(a.value));break;case"select":if(a.type.toLowerCase()==="select-one")e(a.selectedIndex>=0?a.options[a.selectedIndex]:null);else for(var i=0;a.length&&i<a.length;i++)a.options[i].selected&&e(a.options[i])}}function normalize(a){return a?a.replace(/\r?\n/g,"\r\n"):""}function reqwest(a,b){return new Reqwest(a,b)}function init(o,fn){function error(a,b,c){o.error&&o.error(a,b,c),complete(a)}function success(resp){var r=resp.responseText;if(r)switch(type){case"json":try{resp=win.JSON?win.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r}fn(resp),o.success&&o.success(resp),complete(resp)}function complete(a){o.timeout&&clearTimeout(self.timeout),self.timeout=null,o.complete&&o.complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort()},o.timeout)),this.request=getRequest(o,success,error)}function setType(a){var b=a.match(/\.(json|jsonp|html|xml)(\?|$)/);return b?b[1]:"js"}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function getRequest(a,b,c){var d=(a.method||"GET").toUpperCase(),e=typeof a=="string"?a:a.url,f=a.processData!==!1&&a.data&&typeof a.data!="string"?reqwest.toQueryString(a.data):a.data||null;(a.type=="jsonp"||d=="GET")&&f&&(e=urlappend(e,f))&&(f=null);if(a.type=="jsonp")return handleJsonp(a,b,c,e);var g=xhr();g.open(d,e,!0),setHeaders(g,a),g.onreadystatechange=handleReadyState(g,b,c),a.before&&a.before(g),g.send(f);return g}function handleJsonp(a,b,c,d){var e=uniqid++,f=a.jsonpCallback||"callback",g=a.jsonpCallbackName||"reqwest_"+e,h=new RegExp("("+f+")=(.+)(&|$)"),i=d.match(h),j=doc.createElement("script"),k=0;i?i[2]==="?"?d=d.replace(h,"$1="+g+"$3"):g=i[2]:d=urlappend(d,f+"="+g),win[g]=generalCallback,j.type="text/javascript",j.src=d,j.async=!0,typeof j.onreadystatechange!="undefined"&&(j.event="onclick",j.htmlFor=j.id="_reqwest_"+e),j.onload=j.onreadystatechange=function(){if(j[readyState]&&j[readyState]!=="complete"&&j[readyState]!=="loaded"||k)return!1;j.onload=j.onreadystatechange=null,j.onclick&&j.onclick(),a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(j),k=1},head.appendChild(j)}function urlappend(a,b){return a+(/\?/.test(a)?"&":"?")+b}function generalCallback(a){lastValue=a}function setHeaders(a,b){var c=b.headers||{},d={xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"};c.Accept=c.Accept||d[b.type]||"text/javascript, text/html, application/xml, text/xml, */*",b.crossOrigin||(c["X-Requested-With"]=c["X-Requested-With"]||"XMLHttpRequest"),c[contentType]=c[contentType]||"application/x-www-form-urlencoded";for(var e in c)c.hasOwnProperty(e)&&a.setRequestHeader(e,c[e])}function handleReadyState(a,b,c){return function(){a&&a[readyState]==4&&(twoHundo.test(a.status)?b(a):c(a))}}var context=this,win=window,doc=document,old=context.reqwest,twoHundo=/^20\d$/,byTag="getElementsByTagName",readyState="readyState",contentType="Content-Type",head=doc[byTag]("head")[0],uniqid=0,lastValue,xhr="XMLHttpRequest"in win?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")};Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}};var isArray=typeof Array.isArray=="function"?Array.isArray:function(a){return a instanceof Array};reqwest.serializeArray=function(){var a=[];eachFormElement.apply(function(b,c){a.push({name:b,value:c})},arguments);return a},reqwest.serialize=function(){if(arguments.length===0)return"";var a,b,c=Array.prototype.slice.call(arguments,0);a=c.pop(),a&&a.nodeType&&c.push(a)&&(a=null),a&&(a=a.type),a=="map"?b=serializeHash:a=="array"?b=reqwest.serializeArray:b=serializeQueryString;return b.apply(null,c)},reqwest.toQueryString=function(a){var b="",c,d=encodeURIComponent,e=function(a,c){b+=d(a)+"="+d(c)+"&"};if(isArray(a))for(c=0;a&&c<a.length;c++)e(a[c].name,a[c].value);else for(var f in a){if(!Object.hasOwnProperty.call(a,f))continue;var g=a[f];if(isArray(g))for(c=0;c<g.length;c++)e(f,g[c]);else e(f,a[f])}return b.replace(/&$/,"").replace(/%20/g,"+")},reqwest.noConflict=function(){context.reqwest=old;return this};return reqwest})
    
    init(require);
})();
