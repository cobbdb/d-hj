var $ = require('dragonjs'),
    size = $.Dimension(
        $.canvas.width * 0.269,
        64
    );

module.exports = $.Sprite({
    name: 'shop-button',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rect(
        $.Point(
            $.canvas.width - size.width,
            $.canvas.height - size.height
        ),
        size
    ),
    freemask: true,
    strips: {
        'up': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'buttons/shop.png'
            }),
            size: $.Dimension(128, 64)
        })
    },
    startingStrip: 'up',
    pos: $.Point(
        $.canvas.width - size.width,
        $.canvas.height - size.height + 5
    ),
    size: size,
    on: {
        'colliding/screentap': function () {
            $.Game.screen('training').pause();
            $.Game.screen('shop').start();
        }
    }
});
