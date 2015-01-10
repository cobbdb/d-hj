var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    canvas = Game.canvas,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet;

module.exports = Sprite({
    name: 'button-race',
    collisionSets: [
        Dragon.collisions
    ],
    mask: Rect(
        Point(),
        Dimension(88, 31)
    ),
    strips: {
        'button-race': AnimationStrip({
            sheet: SpriteSheet({
                src: 'button.png'
            }),
            size: Dimension(88, 31)
        })
    },
    startingStrip: 'button-race',
    pos: Point(10, canvas.height - 40),
    size: Dimension(93, 31),
    on: {
        'colliding/screentap': function () {
            Game.currentTrack.race();
            this.strip.frame = 1;
            this.pause();
        }
    }
}).extend({
    draw: function (ctx) {
        this.base.draw(ctx);
        ctx.font = '30px Verdana';
        ctx.fillStyle = 'white';
        ctx.fillText(
            'RACE',
            this.pos.x + 5,
            this.pos.y + 27
        );
    }
});
