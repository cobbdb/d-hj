var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    riverton = require('./screens/tracks/riverton.js');

Game.addScreens([
    riverton
]);
Game.currentTrack = riverton;
Game.loadTrack = function (track) {
    this.currentTrack.stop();
    this.currentTrack = track;
    this.currentTrack.start();
};
Game.run(false);
