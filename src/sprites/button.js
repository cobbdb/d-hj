var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    BaseClass = require('baseclassjs');

/**
 * @param {String} opts.title
 * @param {String} [opts.name] Defaults to title.
 * @param {Dimension} opts.size
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    return Sprite({
        name: opts.name || opts.title,
        collisionSets: [
            Dragon.collisions
        ],
        mask: Rect(
            Point(),
            opts.size
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
        pos: opts.pos,
        size: opts.size,
        on: {
            'colliding/screentap': function () {
                this.click();
            }
        }
    }).extend({
        title: opts.title,
        click: BaseClass.Abstract,
        draw: function (ctx) {
            this.base.draw(ctx);
            ctx.font = '30px Verdana';
            ctx.fillStyle = 'white';
            ctx.fillText(
                this.title,
                this.pos.x + 5,
                this.pos.y + 27
            );
        }
    });
};
