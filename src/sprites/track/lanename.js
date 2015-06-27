var $ = require('dragonjs');

/**
 * @param {String} opts.name
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    return $.ui.Label({
        text: opts.name,
        depth: 10,
        pos: opts.pos,
        size: $.Dimension(15, 15),
        style: function (ctx) {
            ctx.font = '12px Wonder';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillStyle = 'black';
        },
        collisionSets: [
            $.collisions
        ],
        mask: $.Rectangle(),
        on: {
            'collide#screenhold': function () {
                this.text = opts.longname;
            },
            'separate#screenhold': function () {
                this.text = opts.name;
            }
        }
    });
};
