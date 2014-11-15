// Load modules

var Hoek = require('hoek');
var Mongo = require('mongodb');

var MongoClient = Mongo.MongoClient;

/*
 Currently the structure of the data looks like this:
 Radio: a device sending in information. Can have many ...
 Sensor: a sensor on the radio device. Reports ...
 Readings
 where:
 id: the network id, this will relate directly to an arduino or other controller
 childId: this is the sensor's id
 type: sensor's type
 subType: the sensor's subtype (dunno if useful yet)
 payload: value from sensor
 currently we're going to be storing keyed on the childId
 */

var internals = {
    defaults: {
        host: '127.0.0.1',
        port: '27017'
    }
};


internals.Data = module.exports = function (options) {

    this.settings = Hoek.applyToDefaults(internals.defaults, options || {});
};


internals.Data.prototype.start = function (callback) {

    var self = this;

    MongoClient.connect('mongodb://' + this.settings.host + ':' + this.settings.port + '/sensorDb', function (err, db) {

        if (err) {
            return callback(err);
        }

        self._db = db;
        self._collection = db.collection('radios');
        self._commands = db.collection('commands');

        return callback();
    });
};


internals.Data.prototype.getRadio = function (id, callback) {

    this._collection.findOne({ id: id }, callback);
};


internals.Data.prototype.getRadios = function (callback) {

    this._collection.find().toArray(callback);
};


internals.Data.prototype.updateRadio = function (id, radio, callback) {

    var self = this;

    this.getRadio(id, function (err, result) {

        // ignore err, can happen if radio doesn't exist
        if (result) {
            Hoek.merge(result, radio);
            radio = result;
        }

        radio.id = id;

        self._collection.update({ id: id }, radio, { upsert: true, w: 1 }, callback);
    });
};


internals.Data.prototype.saveReading = function (radioId, sensorId, reading, callback) {

    var self = this;

    if (!radioId) {
        return callback(new Error('Need Id'));
    }

    this.getRadio(radioId, function (err, radio) {

        // ignore err, can happen if radio doesn't exist
        if (!radio) {
            radio = {};
        }

        radio.sensors = radio.sensors || {};
        radio.sensors[sensorId] = radio.sensors[sensorId] || { readings: [] };

        radio.sensors[sensorId].readings.push(reading);
        self.updateRadio(radioId, radio, callback);
    });
};


internals.Data.prototype.updateSensor = function (radioId, sensorId, sensor, callback) {

    internals.radios.get(radioId, function (err, radio) {

        // ignore err, can happen if radio doesn't exist
        if (!radio) {
            radio = {};
        }

        radio.sensors = radio.sensors || {};
        radio.sensors[sensorId] = radio.sensors[sensorId] || { readings: [] };
        if (sensor.type) {
            radio.sensors[sensorId].type = sensor.type;
        }

        if (sensor.name) {
            radio.sensors[sensorId].name = sensor.name;
        }

        internals.radios.put(radioId, radio, callback);
    });
};


internals.Data.prototype.getSensor = function (radioId, sensorId, callback) {

    this.getRadio(radioId, function (err, radio) {

        if (!radio) {
            return callback(new Error('Radio ' + radioId + ' not found'));
        }

        var sensor = radio.sensors && radio.sensors[sensorId];
        if (!sensor) {
            return callback(new Error('Sensor ' + sensorId + ' not found'));
        }

        return callback(null, sensor);
    });
};

/*
 command object:
 radioId: number id of the radio unit
 sensorId: number id of the sensor unit
 payload: string value of the command
 subType: type of the thing being controlled
 */
internals.Data.prototype.addCommand = function (command, callback) {

    var self = this;

    self._collection.update({ id: 0 }, command, { upsert: true, w: 1 }, callback);
};
