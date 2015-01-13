var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    canvas = Dragon.Game.canvas,
    Trainer = require('./button-train.js');

module.exports = Trainer({
    title: '+STR',
    pos: Point(
        3 / 8 * canvas.width - canvas.height / (3 * 1.73),
        canvas.height / 2 + canvas.height / 3
    ),
    effect: function (set) {
        set.strength += 2;
        console.log(this.title);
    }
});
