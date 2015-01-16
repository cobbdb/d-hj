var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Namer = require('../namer.js'),
    Stats = require('../jockey-stats.js');

module.exports = function (opts) {
    opts = opts || {};

    return Sprite({
        name: 'jockey',
        strips: {
            'jockey': AnimationStrip({
                sheet: SpriteSheet({
                    src: 'jockey.png'
                }),
                size: Dimension(64, 64),
            })
        },
        startingStrip: 'jockey',
        pos: Point(100, 100),
        depth: 2
    }).extend({
        showname: opts.showname || Namer.next.jockey,
        coreStats: opts.stats || Stats(),
        adjStats: Stats(),
        refreshStats: function (mod) {
            var set = this.coreStats.clone();
            mod = mod || function () {};
            mod(set);
            this.adjStats = set;
        }
    });
};
