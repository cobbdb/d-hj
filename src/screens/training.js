var Dragon = require('dragonjs'),
    Screen = Dragon.Screen;

module.exports = Screen({
    name: 'training',
    spriteSet: [
        require('../sprites/ex1.js'),
        require('../sprites/ex2.js')
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
});
