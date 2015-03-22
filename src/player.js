var Horse = require('./sprites/horse.js'),
    Jockey = require('./sprites/jockey.js');

module.exports = {
    money: 100,
    stats: require('./shop-stats.js'),
    refreshStats: function () {
        this.horse.refreshStats();
        this.jockey.refreshStats();
    },
    horse: Horse(),
    jockey: Jockey()
};
