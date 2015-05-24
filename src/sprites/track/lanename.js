var $ = require('dragonjs');

/**
 * @param {String} opts.name
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    return $.ui.Label({
        text: opts.name,
        pos: opts.pos,
        style: function (ctx) {
            ctx.font = '12px Wonder';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillStyle = 'black';
        },
        collisionSets: [
            $.collisions
        ],
        mask: $.Rectangle(
            $.Point(),
            $.Dimension(15, 15)
        ),
        on: {
            'collide/screenhold': function () {
                this.text = opts.longname;
            },
            'separate/screenhold': function () {
                this.text = opts.name;
            }
        }
    }).extend({
        update: function () {
            this.base.base.base.base.update();
        }
    });
};
