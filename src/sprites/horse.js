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
        startFriction = 0.01,
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
        gravity: 0.4, // <- maybe play with this later?
        friction: startFriction,
        name: opts.name || Roster.next.horse.name,
        kind: 'horse',
        depth: 100,
        collisions: [
            require('../collisions/racetrack.js'),
            $.collisions
        ],
        mask: $.Rectangle(),
        strips: 'horse.png',
        scale: 0.5,
        on: {
            '$collide#screenedge/right': function () {
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
        resetFriction: function () {
            this.friction = startFriction;
        },
        endRace: function () {
            this.racing = false;
            this.scale(0.5);
            this.rotation = 0;
        },
        race: function (trackLength) {
            starty = this.pos.y;
            trot = 0.08 * $.random();
            boost = $.random() * 10 + 2;
            this.speed.x = stride = this.stats.adj.body / trackLength;
        },
        jump: function () {
            // Jump.
            this.speed.y = -($.random() * 1.5 + 3);

            // Rotate.
            lean *= -1;
            this.rotation = lean * 0.1 * (
                1 + $.random()
            );

            // Speed boost.
            boost -= 1;
            if (boost < -8) {
                // Reset boost.
                boost = $.random() * 10 + 2;
                this.speed.x = stride * 2.5;
            } else if (boost < 0) {
                // Boost is over - normal speed for a bit.
                this.speed.x = stride;
            }
        },
        update: function () {
            if (this.pos.y >= starty) {
                // this.jump();
            }
            this.base.update();
        }
    });
};
