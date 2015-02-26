var $ = require('dragonjs'),
    pips = $.AnimationStrip({
        sheet: $.SpriteSheet({
            src: 'icons/train-pips.png'
        }),
        size: $.Dimension(16, 4),
        frames: 6
    }),
    stats = require('../../shop-stats.js'),
    width = $.canvas.width,
    height = $.canvas.height,
    center = (width - width * 0.18 - width * 0.1) / 2,
    margin = width * 0.05,
    offset = width * 0.1,
    realWidth = width * 0.18,
    scaleWidth = realWidth / 16,
    pos = {
        facility: $.Point(center + offset - margin - realWidth, height * 0.5),
        groom: $.Point(center + offset - margin - realWidth, height * 0.7),
        doctor: $.Point(center + offset - margin - realWidth, height * 0.9),
        gym: $.Point(center + offset + margin, height * 0.5),
        coach: $.Point(center + offset + margin, height * 0.7)
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
    }
};
