var $ = require('dragonjs'),
    train = require('../sprites/buttons/open-train.js'),
    player = require('../player.js'),
    ranks = require('../sprites/shop/ranks.js'),
    Label = require('../sprites/shop/train-label.js'),
    addRank = require('../sprites/buttons/add-rank.js');

module.exports = $.Screen({
    name: 'train',
    spriteSet: [
        require('../sprites/buttons/open-gear.js'),
        train,
        require('../sprites/buttons/open-care.js'),
        require('../sprites/buttons/race.js'),
        addRank('gym'),
        addRank('coach'),
        addRank('facility'),
        addRank('groom'),
        addRank('doctor'),
        Label('Gym'),
        Label('Coach'),
        Label('Facility'),
        Label('Groom'),
        Label('Doctor'),
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
