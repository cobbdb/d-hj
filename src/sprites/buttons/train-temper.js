var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    canvas = Dragon.Game.canvas,
    Trainer = require('./train.js');

module.exports = Trainer({
    title: '+TPR',
    src: 'buttons/temper.png',
    pos: Point(
        31 * canvas.width / 50,
        canvas.height / 2
    ),
    effect: function (set) {
        set.smarts += 2;
        console.log(this.title);
    }
});
