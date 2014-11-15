// Load modules

var Joi = require('joi');

// Declare internals

var internals = {
    sensors: []
};

module.exports.getAll = {
    description: 'Get all available reporting radios',
    handler: function (request, reply) {

        request.server.methods.getRadios(function (err, radios) {

            return err ? reply(err) : reply(radios);
        });
    }
};

module.exports.update = {
    description: 'Updates to radio values',
    validate: {
        params: {
            radioId: Joi.number().required().description('id of radio')
        },
        payload: {
            name: Joi.number().optional().description('name of radio gateway'),
            version: Joi.string().alphanum().optional().description('version of radio hardware'),
            battery: Joi.string().alphanum().optional().description('battery percentage')
        }
    },
    handler: function (request, reply) {

        var radio = {
            name: request.payload.name,
            version: request.payload.version,
            battery: request.payload.battery
        };

        request.server.methods.updateRadio(request.params.radioId, radio, function (err, result) {

            return err ? reply(err) : reply(result);
        });
    }
};

module.exports.read = {
    description: 'Return a radio',
    validate: {
        params: {
            radioId: Joi.number().required().description('Id for the radio')
        }
    },
    handler: function (request, reply) {

        request.server.methods.readRadio(request.params.radioId, function (err, radio) {

            return err ? reply(err) : reply(radio);
        });
    }
};
