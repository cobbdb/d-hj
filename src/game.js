var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Font = Dragon.Font,
    riverton = require('./screens/tracks/riverton.js');

Font.load({
    name: 'Wonder',
    src: '8-bit-wonder.ttf'
});
Game.addScreens([
    require('./screens/training.js'),
    riverton
]);
Game.currentTrack = riverton;
Game.loadTrack = function (track) {
    this.currentTrack.stop();
    this.currentTrack = track;
    this.currentTrack.start();
};
Game.run(false);
