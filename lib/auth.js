
var Joi = require('joi');


var internals = {};


internals.users = {
    'leet': {
        pass: 'hax0r',
        name: 'Leet Haxor'
    }
};


internals.validate = function validate(user, pass) {

    if (!internals.users[user]) {
        return false;
    }

    return internals.users[user].pass === pass;
};


internals.loginForm = {
    description: 'Login Form',
    handler: function (request, reply) {

        return reply.view('login');
    }
};


internals.login = {
    description: 'Logger Inner',
    validate: {
        payload: {
            username: Joi.string().required(),
            password: Joi.string().required()
        }
    },
    handler: function (request, reply) {

        var user = request.payload.username;
        var pass = request.payload.password;

        if (!internals.validate(user, pass)) {
            return reply.view('login', { fail: true });
        }

        request.auth.session.set({ user: internals.users[user].name });
        return reply.redirect('/');
    }
};


internals.logout = {
    description: 'Logger Outter',
    handler: function (request, reply) {

        request.auth.session.clear();
        return reply.redirect('/');
    }
};


module.exports.registerStrategy = function registerStrategies(server) {

    // Config auth options
    var options = {
        password: '$up3RsssSecr3tz',
        cookie: 'sid',
        isSecure: false,
        redirectTo: '/login',
        ttl: 1000 * 60 * 60 * 24
    };

    // Set session
    server.auth.strategy('session', 'cookie', options);
};


module.exports.routes = [
    { path: '/login', method: 'GET', config: internals.loginForm },
    { path: '/login', method: 'POST', config: internals.login },
    { path: '/logout', method: 'GET', config: internals.logout }
];