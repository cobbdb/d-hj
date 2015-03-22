var $ = require('dragonjs'),
    Namer = require('../namer.js'),
    Illness = require('../illness.js'),
    Stats = require('../horse-stats.js'),
    shopStats = require('../shop-stats.js');

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
            $.Dimension(50, 37)
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
        on: {
            'collide/screenedge/right': function () {
                this.speed.x = 0;
            }
        }
    }).extend({
        showname: opts.showname || Namer.next.horse,
        /**
         * Core & current stats...
         * Core is perm, current is temp
         * When adding core, update current <<<<
         * Current used during races
         * Show current in shop summary
         * Show complete breakdown in shop stat detail view
         * player.horse.stats.body
         * player.horse.stats.core.body
         */
        coreStats: opts.stats || Stats(),
        adjStats: Stats(),
        refreshStats: function (mod) {
            var set = this.coreStats.clone();
            mod = mod || function () {};
            mod(set);
            this.sickness(set);
            this.adjStats = set;
        },
        sickness: Illness.none,
        race: function () {
            this.refreshStats();
            this.speed.x = this.adjStats.speed;
        }
    });
};
