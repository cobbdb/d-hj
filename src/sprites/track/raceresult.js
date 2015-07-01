var $ = require('dragonjs');

module.exports = {
    win: $.Sprite({
        name: 'raceresult-win',
        strips: 'win.png',
        updating: false,
        drawing: false,
        scale: 3,
        pos: $.Point(
            $.canvas.width / 2 - 25 * 3,
            $.canvas.height / 2 - 4 * 3
        )
    }),
    lose: $.Sprite({
        name: 'raceresult-lose',
        strips: 'lost.png',
        updating: false,
        drawing: false,
        scale: 3,
        pos: $.Point(
            $.canvas.width / 2 - 28 * 3,
            $.canvas.height / 2 - 4 * 3
        )
    })
};
