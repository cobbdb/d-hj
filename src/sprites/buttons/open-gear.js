var $ = require('dragonjs');

module.exports = $.ui.Button({
    pos: $.Point(0, 0),
    size: $.Dimension(
        $.canvas.width * 0.15,
        $.canvas.height * 0.3
    ),
    up: {
        src: 'buttons/gear.png',
        size: $.Dimension(11, 35)
    },
    down: {
        src: 'buttons/gear.down.png',
        size: $.Dimension(11, 35)
    },
    onpress: function () {
        $.Game.screen('train').stop();
        $.Game.screen('care').stop();
        $.Game.screen('gear').start();
        this.pause();
    }
});
