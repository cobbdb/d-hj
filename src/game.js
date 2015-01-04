var Dragon = require('dragonjs'),
    Game = Dragon.Game;

Game.addScreens(
    require('./screens/ex1.js')
);
Game.run({
    debug: false
});
