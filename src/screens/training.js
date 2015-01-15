var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    player = require('../player.js'),
    buttons = {
        horse: [
            require('../sprites/buttons/train-speed.js'),
            require('../sprites/buttons/train-strength.js'),
            require('../sprites/buttons/train-jump.js'),
            require('../sprites/buttons/train-smarts.js')
        ],
        jockey: [
            require('../sprites/buttons/train-jsmarts.js'),
            require('../sprites/buttons/train-size.js'),
            require('../sprites/buttons/train-temper.js')
        ]
    },
    allbuttons = [].
        concat(buttons.horse).
        concat(buttons.jockey);

module.exports = Screen({
    name: 'training',
    spriteSet: [
        require('../sprites/bkg-training.js'),
        require('../sprites/buttons/open-shop.js')
    ].concat(allbuttons),
    one: {
        ready: function () {
            this.start();
        }
    }
}).extend({
});
