require('express-namespace');

module.exports.init = function(app) {
    app.get("/", function(req, res) {
        res.render('index', { title: 'rconsole' });
    });
    
    app.get("/demo", function(req, res) {
        console.log(req.headers);
        res.render('demo', { layout: false, host: req.headers.host });
    });
}