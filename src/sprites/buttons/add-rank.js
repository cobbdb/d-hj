var $ = require('dragonjs'),
    len = $.canvas.height * 0.1,
    player = require('../../player.js'),
    ranks = require('../shop/ranks.js');

module.exports = function (name, onpress) {
    onpress = onpress || function () {};
    return $.ui.Button({
        pos: $.Point(
            ranks.pos[name].x + ranks.realWidth - len,
            ranks.pos[name].y - len - 2
        ),
        size: $.Dimension(len, len),
        up: {
            src: 'buttons/plus.png',
            size: $.Dimension(8, 8)
        },
        down: {
            src: 'buttons/plus.null.png',
            size: $.Dimension(8, 8)
        },
        onpress: function () {
            if (player.stats[name] < 5) {
                player.stats[name] += 1;
                onpress();
            }
        }
    }).extend({
        update: function () {
            if (player.stats[name] < 5) {
                this.base.update();
            } else {
                this.useStrip('down');
                this.base.base.update();
            }
        }
    });
};
