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
    Stats = require('../horse-stats.js');

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
        showname: opts.showname || Namer.next.horse,
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
