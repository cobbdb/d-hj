var $ = require('dragonjs'),
    BaseClass = require('baseclassjs');

module.exports = $.ui.Label({
    name: 'countdown',
    text: '-99',
    drawing: false,
    pos: $.Point(
        $.canvas.width / 2,
        $.canvas.height / 2
    ),
    style: function (ctx) {
        ctx.font = '16px Wonder';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
    },
    one: {
        ready: BaseClass.Stub
    }
});
