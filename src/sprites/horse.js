var $ = require('dragonjs'),
    Roster = require('../picker.js'),
    Illness = require('../illness.js'),
    Stats = require('../stats/horse.js'),
    shopStats = require('../shop-stats.js');

/**
 * @param {HorseStats} [opts.stats]
 * @param {String} [opts.name]
 */
module.exports = function (opts) {
    var height, starty,
        // Number of trots for speed boost.
        boost,
        // Speed of the up and down animation cycle.
        trot,
        // Baseline horizontal speed.
        stride,
        // Rotate left or right.
        lean = -1,
        // Current point in animation cycle.
        theta = 3.14;
    opts = opts || {};

    return $.Sprite({
        name: opts.name || Roster.next.horse.name,
        kind: 'horse',
        depth: 100,
        collisionSets: [
            require('../collisions/racetrack.js'),
            $.collisions
        ],
        mask: $.Rectangle(),
        //size: $.Dimension(25, 18),
        strips: {
            'horse': $.AnimationStrip({
                src: 'horse.png'
            })
        },
        scale: 0.5,
        on: {
            'collide#screenedge/right': function () {
                this.speed.x = 0;
                this.scale(2);
                this.rotation = 0;
                this.pos.x = $.canvas.width / 2 - this.size().width / 2;
                this.pos.y = $.canvas.height / 2 - this.size().height / 2;
                $.screen('track').endRace(
                    this === require('../player.js').horse,
                    this
                );
            }
        }
    }).extend({
        stats: Stats(),
        racing: false,
        endRace: function () {
            this.racing = false;
            this.scale(0.5);
            this.rotation = 0;
        },
        race: function (trackLength) {
            this.racing = true;
            starty = this.pos.y;
            trot = 0.08 * $.random();
            boost = $.random() * 10 + 2;
            this.speed.x = stride = this.stats.adj.body / trackLength;
        },
        update: function () {
            if (this.racing) {
                theta += 0.15 + trot;
                if (theta > 3.14) {
                    height = 8 + 10 * $.random();
                    lean *= -1;
                    this.rotation = lean * 0.1 * (
                        1 + $.random()
                    );
                    boost -= 1;
                    if (boost < -8) {
                        // Reset boost.
                        boost = $.random() * 10 + 2;
                        this.speed.x = stride * 2.5;
                    } else if (boost < 0) {
                        // Boost is over - normal speed for a bit.
                        this.speed.x = stride;
                    }
                }
                theta %= 3.14;
                this.pos.y = starty - height * global.Math.abs(
                    global.Math.sin(theta)
                );
            }
            this.base.update();
        }
    });
};
