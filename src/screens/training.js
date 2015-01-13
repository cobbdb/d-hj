var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    player = require('../player.js'),
    buttons = {
        horse: [
            require('../sprites/button-train-speed.js'),
            require('../sprites/button-train-strength.js'),
            require('../sprites/button-train-jump.js'),
            require('../sprites/button-train-smarts.js')
        ]
    };

module.exports = Screen({
    name: 'training',
    spriteSet: [
        player.horse
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
}).extend({
    update: function () {
        buttons.horse.forEach(function (btn) {
            Dragon.collisions.update(btn);
        });
        Dragon.collisions.update(
            Dragon.Collidable({
                name: 'temp',
                mask: Dragon.Circle(
                    Dragon.Point(
                        Dragon.Game.canvas.width * 3 / 8,
                        Dragon.Game.canvas.height / 2
                    ),
                    5
                )
            })
        );
        this.base.update();
    }
});
