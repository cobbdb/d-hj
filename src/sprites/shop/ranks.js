var $ = require('dragonjs'),
    stats = require('../../shop-stats.js'),
    race = require('../buttons/race.js'),
    open = require('../buttons/open-care.js'),
    width = $.canvas.width,
    height = $.canvas.height,
    center = (width - race.realWidth - open.realWidth) / 2 + open.realWidth,
    realWidth = width * 0.3,
    margin = width * 0.02,
    scaleWidth = realWidth / 16;

module.exports = $.Sprite({
    name: 'skillrank-master',
    strips: {
        strip: $.AnimationStrip('icons/train-pips.png', {
            frames: 6
        })
    }
}).extend({
    skillpos: {
        facility: $.Point(center - margin - realWidth, height * 0.5),
        groom: $.Point(center - margin - realWidth, height * 0.7),
        doctor: $.Point(center - margin - realWidth, height * 0.9),
        gym: $.Point(center + margin, height * 0.5),
        coach: $.Point(center + margin, height * 0.7)
    },
    realWidth: realWidth,
    realHeight: 12,
    update: function () {},
    draw: function (ctx) {
        var key, value;
        for (key in stats) {
            this.strip.frame = stats[key];
            this.strip.draw(
                ctx,
                this.skillpos[key],
                $.Dimension(scaleWidth, 3)
            );
        }
    }
});
