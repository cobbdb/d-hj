var $ = require('dragonjs'),
    race = require('./buttons/race.js'),
    margin = {
        side: 0.1,
        bottom: 0.05,
        top: 0.38
    },
    mask = $.Rectangle(
        $.Point(
            $.canvas.width * margin.side,
            $.canvas.height * margin.top
        ),
        $.Dimension(
            $.canvas.width * (
                1 - (race.width + 2 * margin.side)
            ),
            $.canvas.height * (
                1 - (margin.top + margin.bottom)
            )
        )
    );

module.exports = $.ClearSprite({
    name: 'close-shop',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        $.canvas
    ),
    pos: mask,
    size: mask,
    freemask: true,
    on: {
        'colliding/screentap': function (tap) {
            // Close when tapped outside of the menu.
            if (!tap.intersects(mask)) {
                $.Game.screen('shop').stop();
                $.Game.screen('training').start();
            }
        }
    }
}).extend({
    margin: margin,
    update: function () {
        $.collisions.update(this);
    },
    draw: function (ctx) {
        ctx.fillStyle = 'rgba(68, 68, 68, 0.6)';
        ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height
        );
        mask.draw(ctx);
    }
});
