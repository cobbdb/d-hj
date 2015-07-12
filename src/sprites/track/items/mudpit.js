var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js');

/**
 * @class Mudpit
 * @extends LaneItem
 * @param {Number} position Percentage of track where this item lives.
 */
module.exports = function (opts) {
    return LaneItem({
        mask: $.Rectangle(),
        strips: 'mudpit.png',
        on: {
            '$collide.horse': function (horse) {
                console.debug('slow it down', horse.name);
            }
        },
        size: $.Dimension(10, 3)
    }).extend({
        lanePos: opts.position
    });
};
