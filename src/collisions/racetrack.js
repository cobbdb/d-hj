var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler;

module.exports = CollisionHandler({
    name: 'racetrack',
    gridSize: Dimension(5, 5)
});
