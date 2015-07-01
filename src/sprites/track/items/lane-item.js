var $ = require('dragonjs');

/**
 * @class LaneItem
 * @extends Dragon.Sprite
 * @param {Object} opts Map of Sprite options.
 */
module.exports = function (opts) {
    $.mergeDefaults(opts, {
        kind: 'lane-item',
        collisions: [],
        depth: 2
    });
    opts.collisions = [].concat(
        opts.collisions,
        require('../../../collisions/racetrack.js')
    );

    return $.Sprite(opts);
};
