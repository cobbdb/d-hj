var $ = require('dragonjs');

module.exports = $.Screen({
    name: 'care',
    spriteSet: [
        require('../sprites/buttons/open-gear.js'),
        require('../sprites/buttons/open-train.js'),
        require('../sprites/buttons/open-care.js'),
        require('../sprites/buttons/race.js')
    ],
    depth: 0
}).extend({
    draw: function (ctx) {
        ctx.fillStyle = '#fde142';
        ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
        this.base.draw(ctx);
    }
});
