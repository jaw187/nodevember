var Routes = require('./routes');

exports.register = function (pack, options, next) {

    pack.route(Routes);
    next();
};


exports.register.attributes = {

    pkg: require('../package.json')
};
