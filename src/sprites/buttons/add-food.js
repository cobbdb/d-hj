var $ = require('dragonjs'),
    race = require('./race.js');

module.exports = $.ui.Button({
    pos: $.Point(
        //($.canvas.width - race.size.width) / 2 - ($.canvas.height * 0.1) / 2,
        $.canvas.width * 0.02,
        $.canvas.height * 0.5
    ),
    size: $.Dimension(
        $.canvas.height * 0.1,
        $.canvas.height * 0.1
    ),
    up: {
        src: 'buttons/plus.png',
        size: $.Dimension(8, 8)
    },
    onpress: function () {
        console.debug('add food');
    }
});
