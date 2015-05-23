var Track = require('../track.js'),
    makeHorse = require('../../horse-factory.js');

module.exports = Track().extend({
    buildStable: function () {
        return [
            makeHorse(2),
            makeHorse(2),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1),
            makeHorse(1)
        ];
    }
});
