var Dragon = require('dragonjs'),
    canvas = Dragon.Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    size = Dimension(
        canvas.width * 0.269,
        64
    );

module.exports = Sprite({
    name: 'quit-button',
    collisionSets: [
        Dragon.collisions
    ],
    mask: Rect(
        Point(),
        size
    ),
    strips: {
        'up': AnimationStrip({
            sheet: SpriteSheet({
                src: 'buttons/quit.png'
            }),
            size: Dimension(128, 64)
        })
    },
    startingStrip: 'up',
    pos: Point(
        canvas.width - size.width,
        canvas.height - size.height
    ),
    size: size,
    on: {
        'colliding/screentap': function () {
            this.click();
        }
    }
}).extend({
    title: 'SHOP',
    click: function () {
        console.log('shopping is fun.');
    }
});
