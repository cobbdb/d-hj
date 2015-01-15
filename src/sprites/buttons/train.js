var Dragon = require('dragonjs'),
    Circle = Dragon.Circle,
    Sprite = Dragon.Sprite,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    player = require('../../player.js');

/**
 * @param {String} opts.title
 * @param {String} [opts.name] Defaults to title.
 * @param {Point} opts.pos
 * @param {Dimension} opts.size
 * @param {String} opts.src
 */
module.exports = function (opts) {
    return Sprite({
        name: opts.name || opts.title,
        collisionSets: [
            Dragon.collisions
        ],
        mask: Circle(
            opts.pos,
            40
        ),
        freemask: true,
        strips: {
            'up': AnimationStrip({
                sheet: SpriteSheet({
                    src: opts.src
                }),
                size: Dimension(256, 64)
            })
        },
        startingStrip: 'up',
        size: Dimension(128, 32),
        pos: Point(
            opts.pos.x - 64,
            opts.pos.y - 16
        ),
        on: {
            'colliding/screentap': function () {
                this.click();
            }
        }
    }).extend({
        title: opts.title,
        click: function () {
            opts.effect(
                player.horse.coreStats
            );
            player.horse.refreshStats();
        }
    });
};
