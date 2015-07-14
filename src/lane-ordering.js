var $ = require('dragonjs');
console.debug('lane-ordering.js', 'required');
module.exports = function (length) {
    return $.shuffle(
        $.range(length)
    );
};
