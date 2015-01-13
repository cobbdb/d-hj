var RadialButton = require('./radial-button.js'),
    Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    player = require('../player.js');

module.exports = function (opts) {
    return RadialButton({
        title: opts.title,
        pos: opts.pos
    }).extend({
        click: function () {
            opts.effect(
                player.horse.coreStats
            );
            player.horse.refreshStats();
        }
    });
};
