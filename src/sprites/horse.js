var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Namer = require('../namer.js'),
    Illness = require('../illness.js'),
    Stats = require('../stats.js');

module.exports = function (opts) {
    opts = opts || {};
    return Sprite({
        name: 'horse',
        collisionSets: [
            require('../collisions/racetrack.js'),
            Dragon.collisions
        ],
        mask: Rect(
            Point(),
            Dimension(50, 37)
        ),
        strips: {
            'horse': AnimationStrip({
                sheet: SpriteSheet({
                    src: 'horse.png'
                }),
                size: Dimension(50, 37),
            })
        },
        startingStrip: 'horse',
        on: {
            'collide/screenedge/right': function () {
                this.speed.x = 0;
            }
        }
    }).extend({
        showname: opts.showname || Namer.next,
        coreStats: opts.stats || Stats(),
        adjStats: Stats(),
        refreshStats: function (mod) {
            this.adjStats = this.coreStats.scale(mod || {});
            this.adjStats = this.adjStats.scale(this.sickness);
        },
        sickness: Illness.none,
        race: function () {
            this.refreshStats();
            this.speed.x = this.adjStats.speed;
        }
    });
};
