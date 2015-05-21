var $ = require('dragonjs'),
    player = require('../player.js'),
    Util = require('../util.js'),
    result = require('../sprites/raceresult.js'),
    countdown = require('../sprites/countdown.js');

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
            countdown
        ].concat(horses)
    }).extend({
        horses: horses,
        start: function () {
            var dorace = this.race;
            function count(time) {
                countdown.start();
                return function () {
                    if (time > 0) {
                        // Keep counting down to zero.
                        countdown.text = time;
                        global.setTimeout(
                            count(time - 1),
                            1000
                        );
                    } else {
                        // Start the race and show final count frame.
                        countdown.text = "and they're off!";
                        global.setTimeout(function () {
                            countdown.stop();
                        }, 1000);
                        dorace();
                    }
                };
            }
            horses.forEach(function (horse, i) {
                horse.pos.x = 0;
                horse.pos.y = lanes[i] * 45 + 40;
                horse.scale = 1;
            });
            count(4)();
            this.base.start();
        },
        race: function () {
            horses.forEach(function (horse) {
                horse.race();
            });
        },
        endRace: function (playerWon, winner) {
            var that = this,
                resultSprite = playerWon ? result.win : result.lose;
            horses.forEach(function (horse) {
                horse.speed.x = 0;
            });
            this.addSprites({
                set: resultSprite
            });
            global.setTimeout(function () {
                that.removeSprite(resultSprite);
                $.Game.screen('riverton').stop();
                $.Game.screen('train').start();
            }, 2000);
        },
        draw: function (ctx) {
            ctx.fillStyle = '#67fb04';
            ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
            this.base.draw(ctx);
        }
    });
};
