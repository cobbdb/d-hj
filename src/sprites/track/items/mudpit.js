var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js');

/**
 * @class Mudpit
 * @extends LaneItem
 * @param {Number} position Percentage of track where this item lives.
 * @param {Number} [severity] TODO
 */
module.exports = function (opts) {
    var severity = 0.15;
    return LaneItem({
        mask: $.Rectangle(),
        strips: 'mudpit.png',
        on: {
            '$collide.horse': function (horse) {
                horse.friction = severity;
            },
            '$separate.horse': function (horse) {
                horse.resetFriction();
            }
        },
        size: $.Dimension(10, 3)
    }).extend({
        lanePos: opts.position
    });
};
