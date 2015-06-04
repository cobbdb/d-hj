var $ = require('dragonjs'),
    result = require('../sprites/track/raceresult.js');

module.exports = function (opts) {
    return $.Screen({
        name: 'raceresult',
        spriteSet: [
            result.win,
            result.lose
        ],
        depth: 10
    }).extend({
        start: function (win) {
            if (win) {
                result.win.start();
            } else {
                result.lose.start();
            }
            this.base.start();
        },
        stop: function () {
            result.win.stop();
            result.lose.stop();
            this.base.stop();
        }
    });
};
