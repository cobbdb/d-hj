var $ = require('dragonjs'),
    Roster = require('../picker.js'),
    Illness = require('../illness.js'),
    Stats = require('../horse-stats.js'),
    shopStats = require('../shop-stats.js');

/**
 * @param {HorseStats} [opts.stats]
 * @param {String} [opts.showname]
 */
module.exports = function (opts) {
    var theta = 3,
        height, starty, trot;
    opts = opts || {};

    return $.Sprite({
        name: 'horse',
        collisionSets: [
            require('../collisions/racetrack.js'),
            $.collisions
        ],
        mask: $.Rectangle(
            $.Point(),
            $.Dimension(25, 18)
        ),
        strips: {
            'horse': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: 'horse.png'
                }),
                size: $.Dimension(50, 37),
            })
        },
        startingStrip: 'horse',
        scale: 0.5,
        on: {
            'collide/screenedge/right': function () {
                this.speed.x = 0;
                this.scale = 2;
                this.pos.x = $.canvas.width / 2 - this.trueSize().width / 2;
                this.pos.y = $.canvas.height / 2 - this.trueSize().height / 2;
                $.Game.screen('track').endRace(
                    this === require('../player.js').horse,
                    this
                );
            }
        }
    }).extend({
        showname: opts.showname || Roster.next.horse.name,
        coreStats: opts.stats || Stats(),
        adjStats: Stats(),
        racing: false,
        refreshStats: function (mod) {
            var set = this.coreStats.clone();
            mod = mod || function () {};
            mod(set);
            this.sickness(set);
            this.adjStats = set;
        },
        endRace: function () {
            this.racing = false;
            this.scale = 0.5;
        },
        sickness: Illness.none,
        race: function () {
            this.racing = true;
            starty = this.pos.y;
            trot = 0.08 * $.random();
            this.refreshStats();
            this.speed.x = this.adjStats.body / 600;
        },
        update: function () {
            if (this.racing) {
                theta += 0.15 + trot;
                if (theta > 3) {
                    height = 6 + 3 * $.random();
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
