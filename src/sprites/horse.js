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
        refreshStats: function (mod) {
            var set = this.coreStats.clone();
            mod = mod || function () {};
            mod(set);
            this.sickness(set);
            this.adjStats = set;
        },
        resetScale: function () {
            this.scale = 0.5;
        },
        sickness: Illness.none,
        race: function () {
            this.refreshStats();
            this.speed.x = this.adjStats.body / 600;
        }
    });
};
