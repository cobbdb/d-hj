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
    name: 'shop-button',
    collisionSets: [
        Dragon.collisions
    ],
    mask: Rect(
        Point(
            canvas.width - size.width,
            canvas.height - size.height
        ),
        size
    ),
    freemask: true,
    strips: {
        'up': AnimationStrip({
            sheet: SpriteSheet({
                src: 'buttons/shop.png'
            }),
            size: Dimension(128, 64)
        })
    },
    startingStrip: 'up',
    pos: Point(
        canvas.width - size.width,
        canvas.height - size.height + 5
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
