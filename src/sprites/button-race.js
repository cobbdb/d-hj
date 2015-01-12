var Button = require('./button.js'),
    Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    Point = Dragon.Point,
    Game = Dragon.Game,
    canvas = Game.canvas;

module.exports = Button({
    title: 'RACE',
    size: Dimension(93, 31),
    pos: Point(10, canvas.height - 40)
}).extend({
    click: function () {
        Game.currentTrack.race();
        this.strip.frame = 1;
        this.pause();
    }
});
