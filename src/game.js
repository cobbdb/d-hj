var Dragon = require('dragonjs'),
    Game = Dragon.Game;

Game.addScreens(
    require('./screens/racetrack.js')
);
Game.run({
    debug: false
});
