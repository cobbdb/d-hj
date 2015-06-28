var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js');

/**
 * @param {Number} position Percentage of track where this item lives.
 * For example, 
 * @return {Sprite}
 */
module.exports = function (opts) {
    return LaneItem({
        strips: {
            'normal': $.AnimationStrip({
                src: 'haybale.png',
                size: $.Dimension(40, 33),
                frames: 3
            })
        },
        on: {
            'colliding.horse': function (horse) {
                horse.flush(this);
                this.mask.resize($.Dimension(
                    this.mask.width,
                    this.mask.height * 0.98
                ));
                this.mask.move($.Point(
                    this.mask.x,
                    this.pos.y + this.size().height - this.mask.height
                ));
                if (this.mask.height < 4) {
                    this.strip.frame = 2;
                } else if (this.mask.height < 7) {
                    this.strip.frame = 1;
                }
            }
        },
        size: $.Dimension(10, 10),
        mask: $.Rectangle()
    }).extend({
        lanePos: opts.position
    });
};
