/*
 * Copyright 2011 Plupz Ltda.
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

define(function(require, exports, module) {

  require('gcli/index');

  require('rconsole/commands/basic').startup();
  // require('demo/commands/bugs').startup();
  // require('demo/commands/demo').startup();
  // require('demo/commands/experimental').startup();

  var help = require('rconsole/commands/help');
  help.startup();
  help.helpMessages.prefix = "\
    <h2>Welcome to rconsole</h2>\
    <p>rconsole is .....\
    <p>Useful links: \
    <a target='_blank' href='https://github.com/nuxlli/rconsole'>source</a>\
  "
});
