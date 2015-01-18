var $ = require('dragonjs'),
    race = require('./race.js'),
    menu = require('../close-shop.js'),
    margin = {
        top: 0.25
    },
    size = $.Dimension(
        $.canvas.width * 0.3,
        $.canvas.height * (menu.margin.top - margin.top)
    );

module.exports = $.Sprite({
    name: 'shop-button',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        size
    ),
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
        ($.canvas.width - race.size.width) / 2 - size.width / 2,
        $.canvas.height * margin.top
    ),
    size: size,
    on: {
        'colliding/screentap': function () {
            $.Game.screen('training').pause();
            $.Game.screen('shop').start();
        }
    }
});
