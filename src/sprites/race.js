var $ = require('dragonjs');

module.exports = $.Sprite({
    name: 'race',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        $.Dimension(64, 64)
    ),
    strips: {
        'race': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'race.png'
            }),
            start: $.Point(10, 10),
            size: $.Dimension(64, 64),
            frames: 5,
            speed: 10
        })
    },
    startingStrip: 'race',
    pos: $.Point(100, 100),
    depth: 2,
    on: {
        'colliding/screentap': function () {
        }
    }
}).extend({
    update: function () {
        this.base.update();
    }
});
