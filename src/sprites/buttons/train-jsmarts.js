var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+JBRN',
    src: 'buttons/smarts.png',
    pos: $.Point(
        $.canvas.width / 2,
        $.canvas.height / 2 - $.canvas.height / 3
    )
}).extend({
    click: function () {
        player.jockey.coreStats.smarts += 1;
        player.jockey.refreshStats();
    }
});
