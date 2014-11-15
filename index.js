var Hapi = require('hapi');
var Good = require('good');
var Data = require('./lib/data');
var Nodevember = require('./lib');

var HapiAuthCookie = require('hapi-auth-cookie');
var auth = require('./lib/auth');

var server = new Hapi.Server(8080);

server.views({
    engines: { 'html': require('handlebars') },
    path: './views',
    isCached: false
});

server.ext('onRequest', function (req, next) {

    console.log(req.raw.req.url);
    next();
});

var data = new Data();
data.start(function (err) {

    if (err) {
        console.error(err);
    }

    var methods = [
        { name: 'getRadios', fn: data.getRadios, options: { bind: data } },
        { name: 'getRadio', fn: data.getRadio, options: { bind: data } },
        { name: 'updateRadio', fn: data.updateRadio, options: { bind: data } },
        { name: 'saveReading', fn: data.saveReading, options: { bind: data } },
        { name: 'getSensor', fn: data.getSensor, options: { bind: data } },
        { name: 'updateSensor', fn: data.updateSensor, options: { bind: data } },
        { name: 'addCommand', fn: data.addCommand, options: { bind: data } }
    ];

    server.method(methods);

    server.pack.register(HapiAuthCookie, function (err) {

        if (err) {
            return console.log('Oh no\'s!', err);
        }

        auth.registerStrategy(server);
        server.route(auth.routes);

        server.pack.register(Nodevember, function (err) {

            if (err) {
                console.error(err);
            }

            server.start(function () {

                console.log('WHAT HAVE WE DONE!?');
                console.log('http://localhost:' + server.info.port);
            });
        });
    });
});
