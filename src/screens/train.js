var $ = require('dragonjs'),
    train = require('../sprites/buttons/open-train.js'),
    player = require('../player.js'),
    TrainLabel = require('../sprites/shop/train-label.js'),
    StatLabel = require('../sprites/shop/stat-label.js'),
    addRank = require('../sprites/buttons/add-rank.js'),
    shopStats = require('../shop-stats.js');

module.exports = $.Screen({
    name: 'train',
    sprites: [
        require('../sprites/shop/ranks.js'),
        require('../sprites/buttons/open-gear.js'),
        train,
        require('../sprites/buttons/open-care.js'),
        require('../sprites/buttons/race.js'),
        addRank('gym', function () {
            player.jockey.stats.core.body += 1;
        }),
        addRank('coach'),
        addRank('facility', function () {
            var steps = [250, 200, 150, 100, 100],
                bonus = global.Math.floor(
                    $.random() * 50
                ),
                gain = steps[shopStats.facility - 1] + bonus;
            player.horse.stats.core.body += gain;
        }),
        addRank('groom'),
        addRank('doctor'),
        TrainLabel('Gym'),
        TrainLabel('Coach'),
        TrainLabel('Facility'),
        TrainLabel('Groom'),
        TrainLabel('Doctor'),
        StatLabel('horse', 'body'),
        StatLabel('horse', 'mind'),
        StatLabel('horse', 'health'),
        StatLabel('jockey', 'body'),
        StatLabel('jockey', 'mind'),
        StatLabel('jockey', 'temper')
    ],
    one: {
        $added: function () {
            this.start();
            train.pause();
            train.useStrip('down');
        }
    },
    depth: 0
}).extend({
    draw: function (ctx) {
        ctx.fillStyle = '#fde142';
        ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
        this.base.draw(ctx);
    }
});
