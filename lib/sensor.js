// Load modules

var Joi = require('joi');


module.exports.createReading = {
    description: 'Add a reading to a particular child on a radio',
    // validate: {
    //     // params: {
    //     //     radioId: Joi.number().required().description('Id of the radio'),
    //     //     sensorId: Joi.number().required().description('Id of the sensor for the reading')
    //     // },
    //     // payload: {
    //     //     type: Joi.string().alphanum().required().description('type of sensor'),
    //     //     value: Joi.string().required().description('reading from the sensor'),
    //     //     time: Joi.date().required().description('time of the sensor reading')
    //     // }
    // },
    handler: function (request, reply) {

        var reading = {
            type: request.payload.type,
            value: request.payload.value,
            time: request.payload.time
        };

        request.server.methods.saveReading(request.params.radioId, request.params.sensorId, reading, function (err, response) {

            return err ? reply(err) : reply(response);
        });
    }
};

module.exports.updateSensor = {
    description: 'Update meta-data about a sensor',
    validate: {
        params: {
            radioId: Joi.number().required().description('Radio ID'),
            sensorId: Joi.number().required().description('Sensor ID')
        },
        payload: {
            type: Joi.string().alphanum().optional().description('new type for this sensor'),
            name: Joi.string().alphanum().optional().description('new name for this sensor')
        }
    },
    handler: function (request, reply) {

        var sensor = {
            type: request.payload.type,
            name: request.payload.name
        };

        server.methods.updateSensor(request.params.radioId, request.params.sensorId, sensor, function (err, data) {

            return err ? reply(err) : reply(data);
        });
    }
};

module.exports.readSensor = {
    description: 'Get a sensor by ID',
    validate: {
        params: {
            radioId: Joi.number().required().description('Radio ID'),
            sensorId: Joi.number().required().description('Sensor ID')
        }
    },
    handler: function (request, reply) {

        server.methods.getSensor(request.radioId, request.sensorId, function (err, data) {

            return err ? reply(err) : reply(data);
        });
    }
};

module.exports.command = {
    description: 'Send a command to a radio',
    validate: {
        params: {
            radioId: Joi.number().required().description('Radio ID of the target')
        },
        payload: {

        }
    },
    handler: function (request, reply) {

        return reply();
    }
};