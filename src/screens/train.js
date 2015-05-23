var $ = require('dragonjs'),
    train = require('../sprites/buttons/open-train.js'),
    player = require('../player.js'),
    ranks = require('../sprites/shop/ranks.js'),
    TrainLabel = require('../sprites/shop/train-label.js'),
    StatLabel = require('../sprites/shop/stat-label.js'),
    addRank = require('../sprites/buttons/add-rank.js'),
    shopStats = require('../shop-stats.js');

module.exports = $.Screen({
    name: 'train',
    spriteSet: [
        require('../sprites/buttons/open-gear.js'),
        train,
        require('../sprites/buttons/open-care.js'),
        require('../sprites/buttons/race.js'),
        addRank('gym', function () {
            player.jockey.coreStats.body += 1;
            player.jockey.refreshStats();
        }),
        addRank('coach'),
        addRank('facility', function () {
            var steps = [150, 130, 110, 90, 70],
                bonus = global.Math.floor(
                    global.Math.random() * 50
                ),
                gain = steps[shopStats.facility - 1] + bonus;
            player.horse.coreStats.body += gain;
            player.horse.refreshStats();
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
        ready: function () {
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
        ranks.draw(ctx);
        this.base.draw(ctx);
    }
});
