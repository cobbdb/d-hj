var $ = require('dragonjs');

module.exports = function (length) {
    return $.shuffle(
        $.range(length)
    );
};
