var Trainer = require('./button-train.js');

module.exports = Trainer({
    title: 'SPEED',
    effect: function (set) {
        set.speed += 2;
    }
});
