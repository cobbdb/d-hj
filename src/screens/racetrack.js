var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    Horse = require('../sprites/horse.js');

module.exports = function (opts) {
    var horses = [
        Horse()
    ];

    return Screen({
        name: 'racetrack',
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: [
            require('../sprites/button-race.js')
        ].concat(horses),
        one: {
            ready: function () {
                this.start();
            }
        }
    }).extend({
        race: function () {
            horses.forEach(function (horse) {
                horse.race();
            });
        }
    });
};
