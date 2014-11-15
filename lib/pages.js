module.exports.home = {
    auth: 'session',
    handler: function (request, reply) {

        request.server.methods.getRadios(function (err, result) {

            result = result || {};

            console.log(result);

            var context = {
                sensors: result
            };

            reply.view('index', context);
        });
    }
};
