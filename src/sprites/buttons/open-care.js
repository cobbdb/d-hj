var $ = require('dragonjs'),
    height = $.canvas.height * 0.32,
    width = 0.1;

module.exports = $.ui.Button({
    name: 'open-care',
    src: 'buttons/care.png',
    pos: $.Point(0, $.canvas.height - height),
    size: $.Dimension(
        $.canvas.width * width,
        height
    ),
    onpress: function () {
        $.screen('train').stop();
        $.screen('gear').stop();
        $.screen('care').start();
        this.pause();
        require('./open-gear.js').start();
        require('./open-train.js').start();
    }
}).extend({
    width: width,
    realWidth: $.canvas.width * width
});
