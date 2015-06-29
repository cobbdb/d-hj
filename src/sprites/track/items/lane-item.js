var $ = require('dragonjs');

/**
 * @param {Object} opts Map of Sprite options.
 * @param {Image} [img]
 */
module.exports = function (opts, img) {
    $.mergeDefaults(opts, {
        kind: 'lane-item',
        collisionSets: [
            require('../../../collisions/racetrack.js')
        ],
        strips: {
            'default': $.AnimationStrip(img),
        },
        depth: 2
    });

    return $.Sprite(opts);
};
