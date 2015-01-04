var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet;

module.exports = Sprite({
    name: 'horse',
    collisionSets: [
        require('../collisions/racetrack.js'),
        Dragon.collisions
    ],
    mask: Rect(
        Point(),
        Dimension(50, 37)
    ),
    strips: {
        'horse': AnimationStrip({
            sheet: SpriteSheet({
                src: 'horse.png'
            }),
            size: Dimension(50, 37),
        })
    },
    startingStrip: 'horse',
    pos: Point(0, 200),
    speed: Point(1, 0),
    on: {
        'collide/screenedge/right': function () {
            this.speed.x = 0;
        }
    }
});
