
/**
 * Module dependencies.
 */

var express = require('express'),
    app     = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: '4pKbjaoWAViMzGxOEIWMO7CzDoYiSwRdi5kEZne2lPaKlU0soqWwj4CjMI7yxVMeZaYXSgPnB8w5NzDKJ0l87dYzzF2ZiSa7UolPnaobpExRW6DqNQaCHUnq8AzfJ9EwnNbk1s2_UriW_CyCTsjmbx'
  }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Socket.IO
require('./lib/sockets').init(app);

// Routes
require('./lib/routes').init(app);

// Main
app.listen(process.env.PORT || 12540);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
