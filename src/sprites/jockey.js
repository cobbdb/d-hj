var $ = require('dragonjs'),
    Roster = require('../picker.js'),
    Stats = require('../stats/jockey.js');

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
        stats: Stats()
    });
};
