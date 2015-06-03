var $ = require('dragonjs'),
    LaneName = require('./lanename.js');

/**
 * @param {Horse} opts.horse
 * @param {Array of LaneItem} [opts.items]
 */
module.exports = function (opts) {
    var items = opts.items || [],
        horse = opts.horse,
        name;
    return $.Sprite({
        name: 'lane',
        strips: {
            'lane': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: 'lane.png'
                })
            })
        },
        depth: 1
    }).extend({
        getSprites: function () {
            return items.concat(name, horse);
        },
        update: function () {
            items.forEach(function (item) {
                // >>>> turn items on/off when in view.
            });
        },
        pause: function () {
            horse.speed.x = 0;
            name.pause();
            this.base.pause();
        },
        race: function (length) {
        },
        /**
         * @param {Number} i Lane number
         */
        order: function (i) {
            // >>>> Find a way to move this into construction.
            horse.pos.x = 20;
            horse.pos.y = i * 30 + 40;
            name = LaneName({
                name: i + 1,
                longname: horse.showname,
                pos: $.Point(2, i * 30 + 40)
            });
        }
    });
};
