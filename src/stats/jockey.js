var Core = require('./jockey.core.js'),
    Group = require('./group.js');

module.exports = function (opts) {
    return Group(
        Core(opts)
    );
};
