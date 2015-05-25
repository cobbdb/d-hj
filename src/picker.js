var $ = require('dragonjs'),
    stable = require('./data/horses.json');

module.exports = {
    next: {
        get horse () {
            var index = global.Math.floor(
                $.random() * stable.length
            );
            return stable[index];
        },
        get jockey () {
            return 'jimmy';
        }
    }
};
