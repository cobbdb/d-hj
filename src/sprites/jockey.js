var $ = require('dragonjs'),
    Roster = require('../picker.js'),
    Stats = require('../jockey-stats.js');

module.exports = function (opts) {
    opts = opts || {};

    return $.Sprite({
        name: opts.name || Roster.next.jockey.name,
        kind: 'jockey',
        strips: {
            'jockey': $.AnimationStrip({
                src: 'jockey.png'
            })
        },
        size: $.Dimension(64, 64),
        pos: $.Point(100, 100),
        depth: 2
    }).extend({
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
