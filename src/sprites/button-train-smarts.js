var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    canvas = Dragon.Game.canvas,
    Trainer = require('./button-train.js');

module.exports = Trainer({
    title: '+BRN',
    pos: Point(
        3 * canvas.width / 16,
        canvas.height / 2 + 1.73 / 16 * canvas.width
    ),
    effect: function (set) {
        set.smarts += 2;
        console.log(this.title);
    }
});
