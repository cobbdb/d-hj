var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    canvas = Dragon.Game.canvas,
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+STR',
    src: 'buttons/strength.png',
    pos: Point(
        27 * canvas.width / 100,
        canvas.height / 2 + canvas.height / 3
    )
}).extend({
    click: function () {
        player.horse.coreStats.strength += 1;
        player.horse.refreshStats();
    }
});
