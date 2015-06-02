var Track = require('../track.js'),
    makeLane = require('../../lane-factory.js'),
    makeHorse = require('../../horse-factory.js');

/**
 * >>>>>> Why not just remove/add this track each
 * race?? Why does it need to be a singleton???
 * @return {Track}
 */
module.exports = Track().extend({
    // 3000, 5000, 10000
    trackLength: 3000,
    /**
     * @return {Array of Sprites}
     */
    buildVenue: function () {
        return [
            // makeLane({}),
            // makeLane({})
        ];
    },
    /**
     * @deprecated
     */
    buildStable: function () {
        return [
            makeHorse(1),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1)
        ];
    }
});
