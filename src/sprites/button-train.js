var Button = require('./button.js'),
    Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    Point = Dragon.Point,
    Game = Dragon.Game,
    canvas = Game.canvas,
    player = require('../player.js');

module.exports = function (opts) {
    return Button({
        title: opts.title,
        size: Dimension(93, 31),
        pos: Point(10, canvas.height - 40)
    }).extend({
        click: function () {
            opts.effect(
                player.horse.coreStats
            );
            player.horse.refreshStats();
        }
    });
};
