var $ = require('dragonjs');

/**
 * @param {String} img
 * @param {Map of Function} [on]
 * @param {Map of Function} [one]
 */
module.exports = function (opts) {
    $.mergeDefaults(opts, {
        name: 'lane-item',
        collisionSets: [
            require('../../../collisions/racetrack.js')
        ],
        strips: {
            'default': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: opts.img
                })
            })
        },
        depth: 2
    });

    return $.Sprite(opts);
};
