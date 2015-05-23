var $ = require('dragonjs'),
    width = 0.18;

module.exports = $.ui.Button({
    pos: $.Point($.canvas.width * (1 - width), 0),
    size: $.Dimension($.canvas.width * width, $.canvas.height),
    up: {
        src: 'buttons/start-race.png',
        size: $.Dimension(11, 35)
    },
    down: {
        src: 'buttons/start-race.down.png',
        size: $.Dimension(11, 35)
    },
    onpress: function () {
        $.Game.screen('train').stop();
        $.Game.screen('gear').stop();
        $.Game.screen('care').stop();
        $.Game.screen('track').start();
    }
}).extend({
    width: width,
    realWidth: $.canvas.width * width
});
