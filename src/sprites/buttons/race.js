var $ = require('dragonjs'),
    width = 0.18;

module.exports = $.Sprite({
    name: 'race',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        $.Dimension($.canvas.width * width, $.canvas.height)
    ),
    strips: {
        'race': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'start-race.png'
            }),
            size: $.Dimension(88, 31)
        })
    },
    startingStrip: 'race',
    pos: $.Point($.canvas.width * (1 - width), 0),
    size: $.Dimension($.canvas.width * width, $.canvas.height),
    on: {
        'colliding/screentap': function () {
            console.log(".. and they're off!");
        }
    }
}).extend({
    width: width
});
