var Hapi = require('hapi');

var server = new Hapi.Server(8080);

server.route({
    method: 'get',
    path: '/',
    handler: function (request, reply) {

        reply('Hello Server');
    }
});


server.start();
