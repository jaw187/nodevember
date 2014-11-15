var Radio = require('./radio');
var Sensor = require('./sensor');


module.exports = [
    { path: '/radios', method: 'GET', config: Radio.getAll },
    { path: '/radio/{radioId}', method: 'PUT', config: Radio.update },
    { path: '/radio/{radioId}', method: 'GET', config: Radio.read },
    { path: '/radio/{radioId}/sensor/{sensorId}/reading', method: 'POST', config: Sensor.createReading },
    { path: '/radio/{radioId}/sensor/{sensorId}', method: 'PUT', config: Sensor.updateSensor },
    { path: '/radio/{radioId}/sensor/{sensorId}', method: 'GET', config: Sensor.readSensor }
];
