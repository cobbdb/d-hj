var $ = require('dragonjs');

module.exports = $.Sprite({
    name: 'close-shop',
    collisionSets: [
        $.collisions
    ],
    mask: $.Circ(
        $.Point(),
        10
    ),
    strips: {
        'close-shop': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'close.png'
            }),
            size: $.Dimension(32, 32)
        })
    },
    startingStrip: 'close-shop',
    pos: $.Point(100, 100),
    depth: 2,
    on: {
        'collide/screentap': function () {
            $.Game.screen('shop').stop();
            $.Game.screen('training').start();
        }
    }
});
