var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+BRN',
    src: 'buttons/smarts.png',
    pos: $.Point(
        9 * $.canvas.width / 100,
        $.canvas.height / 2 + $.canvas.height / 6
    )
}).extend({
    click: function () {
        player.horse.coreStats.smarts += 1;
        player.horse.refreshStats();
    }
});
