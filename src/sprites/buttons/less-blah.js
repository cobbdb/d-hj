var $ = require('dragonjs'),
    race = require('./race.js');

module.exports = $.ui.Button({
    pos: $.Point(
        ($.canvas.width - race.size.width) - ($.canvas.width * 0.02) - ($.canvas.height * 0.1),
        $.canvas.height * 0.5
    ),
    size: $.Dimension(
        $.canvas.height * 0.1,
        $.canvas.height * 0.1
    ),
    up: {
        src: 'buttons/minus.png',
        size: $.Dimension(8, 8)
    },
    onpress: function () {
        console.debug('less blah');
    }
});
