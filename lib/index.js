var Routes = require('./routes');

exports.register = function (pack, options, next) {

    next();
};


exports.register.attributes = {

    pkg: require('../package.json')
};
