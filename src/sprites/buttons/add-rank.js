var $ = require('dragonjs'),
    len = $.canvas.height * 0.1,
    player = require('../../player.js'),
    ranks = require('../shop/ranks.js');

module.exports = function (name, onpress) {
    onpress = onpress || function () {};
    return $.ui.Button({
        pos: $.Point(
            ranks.skillpos[name].x + ranks.realWidth - len,
            ranks.skillpos[name].y - len - 2
        ),
        size: $.Dimension(len, len),
        strips: {
            up: 'buttons/plus.png',
            down: 'buttons/plus.null.png'
        },
        onpress: function () {
            if (player.stats[name] < 5) {
                player.stats[name] += 1;
                onpress();
            }
            if (player.stats[name] >= 5) {
                this.auto = false;
                this.useStrip('down');
            }
        }
    });
};
