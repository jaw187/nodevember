var Pages = require('./pages');
var Radio = require('./radio');
var Sensor = require('./sensor');


var internals = {
    staticRoute: {
        handler: {
            directory: {
                path: process.cwd() + '/static'
            }
        }
    }
};


module.exports = [
    { path: '/radios', method: 'GET', config: Radio.getAll },
    { path: '/radio/{radioId}', method: 'PUT', config: Radio.update },
    { path: '/radio/{radioId}', method: 'GET', config: Radio.read },
    { path: '/radio/{radioId}/sensor/{sensorId}/reading', method: 'POST', config: Sensor.createReading },
    { path: '/radio/{radioId}/sensor/{sensorId}', method: 'PUT', config: Sensor.updateSensor },
    { path: '/radio/{radioId}/sensor/{sensorId}', method: 'GET', config: Sensor.readSensor },
    { path: '/static/{file*}', method: 'GET', config: internals.staticRoute },
    { path: '/', method: 'GET', config: Pages.home }
];