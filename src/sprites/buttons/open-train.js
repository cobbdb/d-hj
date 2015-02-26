var $ = require('dragonjs'),
    height = $.canvas.height * 0.3;

module.exports = $.ui.Button({
    pos: $.Point(0, height),
    size: $.Dimension(
        $.canvas.width * 0.15,
        height
    ),
    up: {
        src: 'buttons/train.png',
        size: $.Dimension(11, 43)
    },
    down: {
        src: 'buttons/train.down.png',
        size: $.Dimension(11, 43)
    },
    onpress: function () {
        $.Game.screen('gear').stop();
        $.Game.screen('care').stop();
        $.Game.screen('train').start();
        this.pause();
    }
});
