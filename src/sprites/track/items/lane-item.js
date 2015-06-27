var $ = require('dragonjs');

/**
 * @param {String} [img]
 * @param {Map of Function} [on]
 * @param {Map of Function} [one]
 */
module.exports = function (opts) {
    $.mergeDefaults(opts, {
        kind: 'lane-item',
        collisionSets: [
            require('../../../collisions/racetrack.js')
        ],
        strips: {
            'default': $.AnimationStrip({
                src: opts.img
            })
        },
        depth: 2
    });

    return $.Sprite(opts);
};
