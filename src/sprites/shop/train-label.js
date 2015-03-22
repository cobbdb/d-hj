var $ = require('dragonjs'),
    len = $.canvas.height * 0.1,
    ranks = require('./ranks.js');

module.exports = function (name) {
    var keyname = name.toLowerCase();
    return $.ui.Label({
        text: name,
        pos: $.Point(
            ranks.pos[keyname].x + ranks.realWidth - len,
            ranks.pos[keyname].y - 5
        ),
        style: function (ctx) {
            ctx.font = '16px Wonder';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'black';
        }
    });
};
