var Horse = require('./sprites/horse.js'),
    Jockey = require('./sprites/jockey.js');

module.exports = {
    money: 100,
    stats: require('./shop-stats.js'),
    horse: Horse().extend({
        name: 'player'
    }),
    jockey: Jockey()
};
