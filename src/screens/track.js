var $ = require('dragonjs'),
    player = require('../player.js'),
    Util = require('../util.js'),
    result = require('../sprites/raceresult.js');

/**
 * @param {Array} horses
 * @param {String} name
 */
module.exports = function (opts) {
    var i,
        horses = opts.horses.concat(player.horse),
        lanes = Util.range(horses.length);

    Util.shuffle(lanes);

    return $.Screen({
        name: opts.name,
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: [
            //require('../sprites/buttons/race.js'),
        ].concat(horses)
    }).extend({
        horses: horses,
        start: function () {
            horses.forEach(function (horse, i) {
                horse.pos.x = 0;
                horse.pos.y = lanes[i] * 45 + 40;
                horse.scale = 1;
            });
            global.setTimeout(this.race, 4000);
            this.base.start();
        },
        race: function () {
            horses.forEach(function (horse) {
                horse.race();
            });
        },
        endRace: function (playerWon, winner) {
            horses.forEach(function (horse) {
                horse.speed.x = 0;
            });
            this.addSprites({
                set: playerWon ? result.win : result.lose
            });
            global.setTimeout(function () {
                $.Game.screen('riverton').stop();
                $.Game.screen('train').start();
            }, 2000);
        },
        draw: function (ctx) {
            ctx.fillStyle = '#67fb04';
            ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
            this.base.draw(ctx);
        },
        update: function () {
            this.base.update();
        }
    });
};
