var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js');

/**
 * @param {Number} position Percentage of track where this item lives.
 * For example, 
 * @return {Sprite}
 */
module.exports = function (opts) {
    return LaneItem({
        img: 'haybale.png',
        on: {
            'collide.horse': function (other) {
                console.debug(other.showname, 'jump!');
            }
        },
        size: $.Dimension(12, 12),
        mask: $.Rectangle()
    }).extend({
        lanePos: opts.position
    });
};
