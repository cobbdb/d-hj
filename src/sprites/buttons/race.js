var $ = require('dragonjs'),
    Riverton = require('../../screens/tracks/riverton.js'),
    width = 0.18;

module.exports = $.ui.Button({
    pos: $.Point($.canvas.width * (1 - width), 0),
    size: $.Dimension($.canvas.width * width, $.canvas.height),
    strips: {
        up: 'buttons/start-race.png',
        down: 'buttons/start-race.down.png'
    },
    onpress: function () {
        $.screen('train').stop();
        $.screen('gear').stop();
        $.screen('care').stop();
        $.addScreens(
            Riverton()
        );
    }
}).extend({
    width: width,
    realWidth: $.canvas.width * width
});
