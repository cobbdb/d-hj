var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    player = require('../player.js'),
    Util = require('../util.js');

/**
 * @param {Array} horses
 */
module.exports = function (opts) {
    var i,
        horses = opts.horses.concat(player.horse),
        lanes = Util.range(horses.length);

    Util.shuffle(lanes);
    for (i = 0; i < horses.length; i += 1) {
        horses[i].pos.y = lanes[i] * 45 + 40;
    }

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
        horses: horses,
        race: function () {
            horses.forEach(function (horse) {
                horse.race();
            });
        }
    });
};
