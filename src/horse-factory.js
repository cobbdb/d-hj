var $ = require('dragonjs'),
    Horse = require('./sprites/horse.js'),
    Picker = require('./picker.js'),
    Stats = require('./horse-stats.js');

function scale(difficulty) {
    var steps = [1, 1.2, 1.4, 1.6, 1.8],
        bonus = $.random() * 0.1;
    return steps[difficulty] + bonus;
}

/**
 * # Horse Factory
 * Create a horse with some personality.
 * @param {Number} difficulty [0, 5]
 * @return {Horse}
 */
module.exports = function (difficulty) {
    var horse = Picker.next.horse;

    return Horse({
        name: horse.name,
        stats: Stats({
            body: horse.body * scale(difficulty)
        })
    });
};
