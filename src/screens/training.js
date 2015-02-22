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
        var grd = ctx.createRadialGradient(
            $.canvas.width * (1 - race.width) / 2,
            $.canvas.height * 0.05,
            $.canvas.width * 0.1,
            $.canvas.width * (1 - race.width) / 2,
            $.canvas.height * 0.05,
            $.canvas.width
        );
        grd.addColorStop(0, '#dfd3c8');
        grd.addColorStop(1, '#8f8370');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0,
            $.canvas.width * (1 - race.width),
            $.canvas.height
        );
        this.base.draw(ctx);
    }
});
