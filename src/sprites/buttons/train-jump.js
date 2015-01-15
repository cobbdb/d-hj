var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    canvas = Dragon.Game.canvas,
    Trainer = require('./train.js');

module.exports = Trainer({
    title: '+JMP',
    src: 'buttons/jump.png',
    pos: Point(
        9 * canvas.width / 100,
        canvas.height / 2 - canvas.height / 6
    ),
    effect: function (set) {
        set.jump += 2;
        console.log(this.title);
    }
});
