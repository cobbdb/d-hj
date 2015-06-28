var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js'),
    img = $.pipeline.add.image('mudpit.png');

/**
 * @param {Number} position Percentage of track where this item lives.
 * @return {Sprite}
 */
module.exports = function (opts) {
    return LaneItem({
        strips: {
            'normal': $.AnimationStrip(img)
        },
        on: {
            'collide.horse': function (horse) {
                console.debug('slow it down', horse.name);
            }
        },
        size: $.Dimension(10, 3),
        mask: $.Rectangle()
    }).extend({
        lanePos: opts.position
    });
};
