var $ = require('dragonjs');

/**
 * @class LaneItem
 * @extends Dragon.Sprite
 * @param {Object} opts Map of Sprite options.
 */
module.exports = function (opts) {
    opts = opts || {};
    opts.kind = opts.kind || 'lane-item';
    opts.depth = opts.depth || 2;
    opts.collisions = $.concatLeft(
        opts.collisions,
        require('../../../collisions/racetrack.js')
    );

    return $.Sprite(opts);
};
