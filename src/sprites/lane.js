var $ = require('dragonjs');

/**
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    var things = [];
    return $.Sprite({
        name: 'lane',
        strips: {
            'lane': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: 'lane.png'
                })
            })
        },
        pos: opts.pos,
        depth: 1
    }).extend({
        update: function () {
            things.forEach(function (thing) {
                // do stuff
            });
        }
    });
};
