var $ = require('dragonjs');

/**
 * @class HaybaleEmitter
 * @extends Dragon.Emitter
 */
module.exports = function () {
    return $.particle.Emitter({
        name: 'haybale-emitter',
        type: $.particle.Square,
        pos: $.Point(),
        volume: 8,
        speed: 0,
        style: function (ctx) {
            if (this.damage === 0) {
                ctx.fillStyle = '#eac644';
            } else if (this.damage === 1) {
                ctx.fillStyle = '#7f6a00';
            } else {
                ctx.fillStyle = '#7f0000';
            }
        },
        conf: function () {
            return {
                friction: 0.05,
                gravity: 0.1,
                speed: $.Vector(
                    ($.random() - 0.5) * 5,
                    -$.random() * 5
                )
            };
        }
    }).extend({
        damage: 0
    });
};
