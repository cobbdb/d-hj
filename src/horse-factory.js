var $ = require('dragonjs'),
    Horse = require('./sprites/horse.js'),
    Picker = require('./picker.js'),
    Stats = require('./horse-stats.js');

function scale(difficulty) {
    var steps = [100, 180, 240, 280, 300],
        bonus = global.Math.floor(
            $.random() * 50
        );
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
        showname: horse.name,
        stats: Stats({
            body: horse.body + scale(difficulty)
        })
    });
};
