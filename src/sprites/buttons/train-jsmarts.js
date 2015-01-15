var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    canvas = Dragon.Game.canvas,
    Trainer = require('./train.js');

module.exports = Trainer({
    title: '+JBRN',
    src: 'buttons/smarts.png',
    pos: Point(
        canvas.width / 2,
        canvas.height / 2 - canvas.height / 3
    ),
    effect: function (set) {
        set.smarts += 2;
        console.log(this.title);
    }
});
