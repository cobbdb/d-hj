var $ = require('dragonjs'),
    height = $.canvas.height * 0.32;

module.exports = $.ui.Button({
    name: 'open-care',
    pos: $.Point(0, $.canvas.height - height),
    size: $.Dimension(
        $.canvas.width * 0.1,
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
        require('./open-gear.js').start();
        require('./open-train.js').start();
    }
});
