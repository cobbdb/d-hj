var Dragon = require('dragonjs'),
    Screen = Dragon.Screen;

module.exports = Screen({
    name: 'racetrack',
    collisionSets: [
        require('../collisions/racetrack.js')
    ],
    spriteSet: [
        require('../sprites/horse.js')
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
});
