var $ = require('dragonjs'),
    Lane = require('./sprites/track/lane.js'),
    HayBale = require('./sprites/track/items/haybale.js'),
    MudPit = require('./sprites/track/items/mudpit.js'),
    player = require('./player.js'),
    makeHorse = require('./horse-factory.js'),
    itemCount = {
        'none': 0,
        'low': 4,
        'medium': 8,
        'high': 12
    };

/**
 * @param {Number} difficulty [0, 6] 0/false if player's lane.
 * @param {String} opts.density ['none', 'low', 'medium', 'high']
 * @param {String} opts.terrain ['dirt', 'grass', 'rock']
 * @param {String} opts.weather ['comfy', 'rain', 'storm', 'snow', 'heat']
 * @param {String} opts.type ['pro', 'rural', 'scifi']
 * @return {Function} Lane constructor.
 */
module.exports = function (difficulty, opts) {
    var i,
        len = itemCount[opts.density],
        bonus = $.random() * itemCount[opts.density] / 2,
        itemSet = [];

    len += bonus;
    len = 1; // <-- debug
    for (i = 0; i < len; i += 1) {
        itemSet.push(HayBale({
            position: 0.3
        }));
        itemSet.push(MudPit({
            position: 0.5
        }));
    }

    /**
     * @param {Number} order Lane order in its track.
     * @return {Lane}
     */
    return function (order) {
        return Lane({
            horse: (difficulty) ? makeHorse(difficulty - 1) : player.horse,
            order: order,
            items: itemSet
        });
    };
};
