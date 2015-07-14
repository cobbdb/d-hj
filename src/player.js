var Horse = require('./sprites/horse.js'),
    Jockey = require('./sprites/jockey.js');
console.debug('player.js', 'required');
module.exports = {
    money: 100,
    stats: require('./shop-stats.js'),
    horse: Horse().extend({
        kind: 'player-horse'
    }),
    jockey: Jockey()
};
