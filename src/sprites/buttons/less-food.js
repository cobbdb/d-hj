var $ = require('dragonjs'),
    race = require('./race.js'),
    len = $.canvas.height * 0.1,
    margin = $.canvas.width * 0.02;

module.exports = $.ui.Button({
    pos: $.Point(
        ($.canvas.width - race.size.width) / 2 - margin - len,
        $.canvas.height * 0.5
    ),
    size: $.Dimension(len, len),
    up: {
        src: 'buttons/minus.png',
        size: $.Dimension(8, 8)
    },
    onpress: function () {
        console.debug('less food');
    }
});
