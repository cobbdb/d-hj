var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Namer = require('../namer.js');

module.exports = function (opts) {
    return Sprite({
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
        on: {
            'collide/screenedge/right': function () {
                this.speed.x = 0;
            }
        }
    }).extend({
        showname: Namer.next,
        stat: {
            speed: 1,
            jump: 0,
            strength: 0,
            smarts: 0,
            health: 100
        },
        sickness: 'none',
        race: function () {
            this.speed.x = this.stat.speed;
        }
    });
};
