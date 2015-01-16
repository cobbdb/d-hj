var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+TPR',
    src: 'buttons/temper.png',
    pos: $.Point(
        31 * $.canvas.width / 50,
        $.canvas.height / 2
    )
}).extend({
    click: function () {
        player.jockey.coreStats.temper += 1;
        player.jockey.refreshStats();
    }
});
