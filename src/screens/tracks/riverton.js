var Track = require('../track.js'),
    makeLane = require('../../lane-factory.js');

/**
 * @return {Track}
 */
module.exports = function () {
    var laneConf = {
        density: 'low',
        terrain: 'dirt',
        weather: 'comfy',
        type: 'rural'
    };

    return Track({
        laneFactories: [
            makeLane(false, laneConf),
            makeLane(2, laneConf),
            makeLane(1, laneConf),
            makeLane(1, laneConf),
            makeLane(1, laneConf)
        ]
    }).extend({
        // 3000, 5000, 10000
        trackLength: 3000
    });
};
