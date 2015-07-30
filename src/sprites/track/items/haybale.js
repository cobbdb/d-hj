var $ = require('dragonjs'),
    LaneItem = require('./lane-item.js'),
    Emitter = require('../../effects/haybale-emitter.js');

/**
 * @class Haybale
 * @extends LaneItem
 * @param {Number} opts.position Percentage of track where this item lives.
 * @param {Horse} opts.horse
 */
module.exports = function (opts) {
    //var emitter = Emitter();
    return LaneItem({
        strips: {
            'normal': $.AnimationStrip('haybale.png', {
                frames: 3
            })
        },
        on: {
            '$colliding.horse': function (horse) {
                if (horse === opts.horse) {
                    horse.flush(this);
                    horse.jump();
                    this.shrink();
                }
            }
        },
        size: $.Dimension(10, 10),
        mask: $.Rectangle()
    }).extend({
        lanePos: opts.position,
        /**
         * Explosion effect to show damage.
         */
        //spark: emitter.fire,
        move: function (pos) {
            //emitter.move(pos);
            this.base.move(pos);
        },
        update: function () {
            //emitter.update();
            this.base.update();
        },
        draw: function (ctx) {
            //emitter.draw(ctx);
            this.base.draw(ctx);
        },
        shrink: function () {
            this.mask.resizeFixed(
                this.mask.width,
                this.mask.height * 0.91
            );
            this.mask.moveFixed(
                this.mask.x,
                this.pos.y + this.size().height - this.mask.height
            );
            /*if (emitter.damage === 1 && this.mask.height < 4) {
                emitter.damage = 2;
                this.strip.frame = 2;
                this.spark();
            } else if (emitter.damage === 0 && this.mask.height < 7) {
                emitter.damage = 1;
                this.strip.frame = 1;
                this.spark();
            }*/
        }
    });
};
