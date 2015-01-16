var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    canvas = Dragon.Game.canvas,
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+JMP',
    src: 'buttons/jump.png',
    pos: Point(
        9 * canvas.width / 100,
        canvas.height / 2 - canvas.height / 6
    )
}).extend({
    click: function () {
        player.horse.coreStats.jump += 1;
        player.horse.refreshStats();
    }
});
