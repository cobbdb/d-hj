var $ = require('dragonjs'),
    OpenGear = require('../sprites/buttons/open-gear.js'),
    OpenTrain = require('../sprites/buttons/open-train.js'),
    OpenCare = require('../sprites/buttons/open-care.js'),
    Race = require('../sprites/buttons/race.js');

module.exports = $.Screen({
    name: 'care',
    spriteSet: [
        OpenGear(),
        OpenTrain(),
        OpenCare(),
        Race()
    ],
    depth: 0
}).extend({
    draw: function (ctx) {
        ctx.fillStyle = '#fde142';
        ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
        this.base.draw(ctx);
    }
});
