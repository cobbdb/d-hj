var $ = require('dragonjs'),
    height = $.canvas.height * 0.3;

module.exports = $.ui.Button({
    pos: $.Point(0, $.canvas.height - height),
    size: $.Dimension(
        $.canvas.width * 0.15,
        height
    ),
    up: {
        src: 'buttons/care.png',
        size: $.Dimension(11, 35)
    },
    down: {
        src: 'buttons/care.down.png',
        size: $.Dimension(11, 35)
    },
    onpress: function () {
        $.Game.screen('train').stop();
        $.Game.screen('gear').stop();
        $.Game.screen('care').start();
        this.pause();
    }
});
