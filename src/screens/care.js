var $ = require('dragonjs'),
    player = require('../player.js'),
    race = require('../sprites/buttons/race.js'),
    Slider = require('../sprites/shop/slider.js');

module.exports = $.Screen({
    name: 'training',
    spriteSet: [
        require('../sprites/buttons/open-shop.js'),
        race,
        require('../sprites/buttons/add-food.js'),
        require('../sprites/buttons/less-food.js'),
        require('../sprites/buttons/less-blah.js'),
    ],
    one: {
        ready: function () {
            this.start();
        }
    },
    depth: 0
}).extend({
    draw: function (ctx) {
        this.base.draw(ctx);
    }
});
