var $ = require('dragonjs'),
    pips = $.AnimationStrip({
        sheet: $.SpriteSheet({
            src: 'icons/train-pips.png'
        }),
        size: $.Dimension(16, 4),
        frames: 6
    }),
    stats = require('../../shop-stats.js'),
    race = require('../buttons/race.js'),
    open = require('../buttons/open-care.js'),
    width = $.canvas.width,
    height = $.canvas.height,
    center = (width - race.realWidth - open.realWidth) / 2 + open.realWidth,
    realWidth = width * 0.3,
    margin = width * 0.02,
    scaleWidth = realWidth / 16,
    pos = {
        facility: $.Point(center - margin - realWidth, height * 0.5),
        groom: $.Point(center - margin - realWidth, height * 0.7),
        doctor: $.Point(center - margin - realWidth, height * 0.9),
        gym: $.Point(center + margin, height * 0.5),
        coach: $.Point(center + margin, height * 0.7)
    };

pips.load();

module.exports = {
    draw: function (ctx) {
        var key, value;
        for (key in stats) {
            pips.frame = stats[key];
            pips.draw(
                ctx,
                pos[key],
                $.Dimension(scaleWidth, 3)
            );
        }
    },
    pos: pos,
    realWidth: realWidth,
    realHeight: 12
};
