var Dragon = require('dragonjs'),
    Circle = Dragon.Circle,
    Collidable = Dragon.Collidable,
    BaseClass = require('baseclassjs');

/**
 * @param {String} opts.title
 * @param {String} [opts.name] Defaults to title.
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    return Collidable({
        name: opts.name || opts.title,
        collisionSets: [
            Dragon.collisions
        ],
        mask: Circle(
            opts.pos,
            30
        ),
        on: {
            'colliding/screentap': function () {
                this.click();
            }
        }
    }).extend({
        title: opts.title,
        click: BaseClass.Abstract
    });
};
