var Core = require('./horse.core.js'),
    Group = require('./group.js');

module.exports = function (opts) {
    return Group(
        Core(opts)
    );
};
