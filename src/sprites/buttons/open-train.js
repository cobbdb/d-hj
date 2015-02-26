var $ = require('dragonjs');

module.exports = $.ui.Button({
    name: 'open-train',
    pos: $.Point(0, $.canvas.height * 0.32),
    size: $.Dimension(
        $.canvas.width * 0.1,
        $.canvas.height * 0.36
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
        require('./open-gear.js').start();
        require('./open-care.js').start();
    }
});
