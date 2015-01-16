var $ = require('dragonjs'),
    BaseClass = require('baseclassjs'),
    player = require('../player.js'),
    marks = {
        horse: {
            speed: $.Point(
                $.canvas.width * 0.29,
                $.canvas.height / 2 - $.canvas.height * 0.15
            ),
            jump: $.Point(
                $.canvas.width * 0.18,
                $.canvas.height / 2 - $.canvas.height * 0.06
            ),
            smarts: $.Point(
                $.canvas.width * 0.18,
                $.canvas.height / 2 + $.canvas.height * 0.06
            ),
            strength: $.Point(
                $.canvas.width * 0.29,
                $.canvas.height / 2 + $.canvas.height * 0.15
            )
        },
        jockey: {
            smarts: $.Point(
                $.canvas.width * 0.435,
                $.canvas.height / 2 - $.canvas.height * 0.14
            ),
            temper: $.Point(
                $.canvas.width * 0.505,
                $.canvas.height / 2
            ),
            size: $.Point(
                $.canvas.width * 0.435,
                $.canvas.height / 2 + $.canvas.height * 0.14
            )
        }
    };

module.exports = $.Sprite({
    name: 'stats',
    depth: 2
}).extend({
    load: function (cb) {
        cb();
    },
    start: BaseClass.Stub,
    update: BaseClass.Stub,
    draw: function (ctx) {
        var name, mark;
        ctx.font = '16px Wonder';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        for (name in marks.horse) {
            mark = marks.horse[name];
            ctx.fillText(
                player.horse.coreStats[name],
                mark.x,
                mark.y
            );
        }
        for (name in marks.jockey) {
            mark = marks.jockey[name];
            ctx.fillText(
                player.jockey.coreStats[name],
                mark.x,
                mark.y
            );
        }
    }
});
