var $ = require('dragonjs'),
    BaseClass = require('baseclassjs');

module.exports = {
    win: $.ui.Decal({
        strip: {
            src: 'win.png',
            size: $.Dimension(50, 9)
        },
        scale: 3,
        pos: $.Point(
            $.canvas.width / 2 - 25 * 3,
            $.canvas.height / 2 - 4 * 3
        ),
        name: 'raceresult-win',
        updating: false,
        drawing: false
    }),
    lose: $.ui.Decal({
        strip: {
            src: 'lost.png',
            size: $.Dimension(57, 9)
        },
        scale: 3,
        pos: $.Point(
            $.canvas.width / 2 - 28 * 3,
            $.canvas.height / 2 - 4 * 3
        ),
        name: 'raceresult-lose',
        updating: false,
        drawing: false
    })
};
