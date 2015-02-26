var $ = require('dragonjs');

module.exports = $.Screen({
    name: 'train',
    spriteSet: [
        require('../sprites/buttons/open-gear.js'),
        require('../sprites/buttons/open-train.js'),
        require('../sprites/buttons/open-care.js'),
        require('../sprites/buttons/race.js')
    ],
    one: {
        ready: function () {
            console.debug(this.name, 'rsdfeady');
            this.stop();
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
