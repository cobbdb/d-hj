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
        // Build the lanes.
        var lanes = [
            // makeLane({}),
            // makeLane({}),
            // makeLane({})
        ];
        /**
         * >>>>>>>> everything below here can be
         * pushed inside of the Track class.
         */
        // Get the lane items.
        var items = [];
        lanes.forEach(function (lane) {
            items.concat(lane.items);
        });
        // Return the list of all lanes and items.
        return lanes.concat(items);
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
