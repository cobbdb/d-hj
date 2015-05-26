var Track = require('../track.js'),
    makeHorse = require('../../horse-factory.js');

module.exports = Track().extend({
    // 3000, 5000, 10000
    trackLength: 3000,
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
