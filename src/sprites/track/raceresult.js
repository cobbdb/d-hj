var $ = require('dragonjs');

module.exports = {
    win: $.ui.Decal({
        name: 'raceresult-win',
        updating: false,
        drawing: false,
        strips: 'win.png',
        scale: 3,
        pos: $.Point(
            $.canvas.width / 2 - 25 * 3,
            $.canvas.height / 2 - 4 * 3
        )
    }),
    lose: $.ui.Decal({
        name: 'raceresult-lose',
        updating: false,
        drawing: false,
        strips: 'lost.png',
        scale: 3,
        pos: $.Point(
            $.canvas.width / 2 - 28 * 3,
            $.canvas.height / 2 - 4 * 3
        )
    })
};
