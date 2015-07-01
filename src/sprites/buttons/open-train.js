var $ = require('dragonjs');

module.exports = $.ui.Button({
    name: 'open-train',
    pos: $.Point(0, $.canvas.height * 0.32),
    size: $.Dimension(
        $.canvas.width * 0.1,
        $.canvas.height * 0.36
    ),
    strips: {
        up: 'buttons/train.png',
        down: 'buttons/train.down.png'
    },
    onpress: function () {
        $.screen('gear').stop();
        $.screen('care').stop();
        $.screen('train').start();
        this.pause();
        require('./open-gear.js').start();
        require('./open-care.js').start();
    }
});
