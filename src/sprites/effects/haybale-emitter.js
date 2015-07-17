var $ = require('dragonjs');

/**
 * @class HaybaleEmitter
 * @extends Dragon.Emitter
 * @param {Point} [opts.pos]
 */
module.exports = function (opts) {
    opts = opts || {};

    return $.particle.Emitter({
        name: 'haybale-emitter',
        type: $.particle.Square,
        pos: opts.pos || $.Point(),
        volume: 8,
        speed: 1000,
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
                friction: 0.06,
                lifespan: 1000,
                gravity: 0.015,
                speed: $.Vector(
                    ($.random() - 0.5) * 6,
                    ($.random() - 0.5) * 6
                )
            };
        }
    }).extend({
        damage: 0
    });
};
