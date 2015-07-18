var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js');

/**
 * @class Mudpit
 * @extends LaneItem
 * @param {Number} position Percentage of track where this item lives.
 * @param {Number} [severity] TODO
 * @param {Horse} opts.horse
 */
module.exports = function (opts) {
    var severity = 0.15;
    return LaneItem({
        mask: $.Rectangle(),
        strips: 'mudpit.png',
        on: {
            '$collide.horse': function (horse) {
                if (horse === opts.horse) {
                    horse.friction = severity;
                }
            },
            '$separate.horse': function (horse) {
                if (horse === opts.horse) {
                    horse.resetFriction();
                }
            }
        },
        size: $.Dimension(10, 3)
    }).extend({
        lanePos: opts.position
    });
};
