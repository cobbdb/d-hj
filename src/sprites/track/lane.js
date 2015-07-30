var $ = require('dragonjs'),
    LaneName = require('./lanename.js');

/**
 * @param {Horse} opts.horse
 * @param {Number} opts.order
 * @param {Array of LaneItem} [opts.items]
 */
module.exports = function (opts) {
    var items = opts.items || [],
        item, i, len = items.length,
        horse = opts.horse,
        order = opts.order,
        ypos = order * 50 + 40,
        height = $.canvas.height / 20,
        name = LaneName({
            name: order + 1,
            longname: horse.name,
            pos: $.Point(2, ypos)
        });

    horse.pause();
    horse.moveFixed(20, ypos);
    for (i = 0; i < len; i += 1) {
        item = items[i];
        item.moveFixed(
            item.lanePos * $.canvas.width,
            ypos + height - item.size().height
        );
    }

    return $.Sprite({
        kind: 'lane',
        strips: 'lane.png',
        size: $.Dimension(
            $.canvas.width,
            height
        ),
        collisions: require('../../collisions/racetrack.js'),
        mask: $.Rectangle(0, height, $.canvas.width, 10),
        pos: $.Point(0, ypos),
        depth: 1,
        on: {
            '$colliding.horse': function (other) {
                if (other === horse) {
                    horse.jump();
                }
            }
        }
    }).extend({
        getSprites: function () {
            return $.concat(items, name, horse);
        },
        update: function () {
            var item, i, len = items.length;
            for (i = 0; i < len; i += 1) {
                // >>>> turn items on/off when in view.
            }
            this.base.update();
        },
        pause: function () {
            horse.pause();
            name.pause();
            this.base.pause();
        },
        race: function (length) {
            horse.start();
            horse.race(length);
        }
    });
};
