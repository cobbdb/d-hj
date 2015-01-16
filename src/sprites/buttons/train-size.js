var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    canvas = Dragon.Game.canvas,
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+SZE',
    src: 'buttons/size.png',
    pos: Point(
        canvas.width / 2,
        canvas.height / 2 + canvas.height / 3
    )
}).extend({
    click: function () {
        player.jockey.coreStats.size += 1;
        player.jockey.refreshStats();
    }
});
