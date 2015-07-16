var $ = require('dragonjs');

module.exports = $.Screen({
    name: 'care',
    sprites: [
        require('../sprites/buttons/open-gear.js'),
        require('../sprites/buttons/open-train.js'),
        require('../sprites/buttons/open-care.js'),
        require('../sprites/buttons/race.js')
    ],
    depth: 0
}).extend({
    draw: function (ctx) {
        $.canvas.clear('#fde142');
        this.base.draw(ctx);
    }
});
