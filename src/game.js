var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Font = Dragon.Font,
    riverton = require('./screens/tracks/riverton.js');

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
