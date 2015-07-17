var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js'),
    Emitter = require('../../effects/haybale-emitter.js');

/**
 * @class Haybale
 * @extends LaneItem
 * @param {Number} position Percentage of track where this item lives.
 */
module.exports = function (opts) {
    var emitter = Emitter();
    return LaneItem({
        strips: {
            'normal': $.AnimationStrip('haybale.png', {
                frames: 3
            })
        },
        on: {
            '$colliding.horse': function (horse) {
                horse.flush(this);
                horse.jump();
                this.shrink();
            }
        },
        size: $.Dimension(10, 10),
        mask: $.Rectangle()
    }).extend({
        lanePos: opts.position,
        /**
         * Explosion effect to show damage.
         */
        spark: function () {
            console.debug('boom!');
            emitter.fire();
        },
        move: function (pos) {
            emitter.move(pos);
            this.base.move(pos);
        },
        update: function () {
            emitter.update();
            this.base.update();
        },
        draw: function (ctx) {
            emitter.draw(ctx);
            this.base.draw(ctx);
        },
        teardown: function () {
            emitter.teardown();
            this.base.teardown();
        },
        shrink: function () {
            this.mask.resize($.Dimension(
                this.mask.width,
                this.mask.height * 0.5//0.92
            ));
            this.mask.move($.Point(
                this.mask.x,
                this.pos.y + this.size().height - this.mask.height
            ));
            if (this.mask.height < 4) {
                this.strip.frame = 2;
                this.spark();
            } else if (this.mask.height < 7) {
                this.strip.frame = 1;
                this.spark();
            }
        }
    });
};
