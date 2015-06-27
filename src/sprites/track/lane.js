var $ = require('dragonjs'),
    LaneName = require('./lanename.js');

/**
 * @param {Horse} opts.horse
 * @param {Number} opts.order
 * @param {Array of LaneItem} [opts.items]
 */
module.exports = function (opts) {
    var items = opts.items || [],
        horse = opts.horse,
        order = opts.order,
        ypos = order * 40 + 40,
        name = LaneName({
            name: order + 1,
            longname: horse.showname,
            pos: $.Point(2, ypos)
        });

    horse.move($.Point(20, ypos));
    items.forEach(function (item) {
        item.move($.Point(
            item.lanePos * $.canvas.width,
            ypos + item.size.height
        ));
    });

    return $.Sprite({
        name: 'lane',
        strips: {
            'lane': $.AnimationStrip({
                src: 'lane.png'
            })
        },
        size: $.Dimension(
            $.canvas.width,
            $.canvas.height / 20
        ),
        pos: $.Point(0, ypos),
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
            horse.race(length);
        }
    });
};
