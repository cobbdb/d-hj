var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Track = require('./screens/racetrack.js');

Game.addScreens([
    Track()
]);
Game.run(false);
