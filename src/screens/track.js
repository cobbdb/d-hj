var BaseClass = require('baseclassjs'),
    $ = require('dragonjs'),
    player = require('../player.js'),
    Util = require('../util.js'),
    result = require('../sprites/raceresult.js'),
    countdown = require('../sprites/countdown.js');

/**
 */
module.exports = function (opts) {
    var stable = [];

    return $.Screen({
        name: 'track',
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: [
            countdown
        ]
    }).extend({
        buildStable: BaseClass.Abstract,
        getStable: function () {
            return stable;
        },
        start: function () {
            var dorace = this.race,
                lanes;

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

            // Build the stable and assign lanes.
            stable = this.buildStable().concat(
                player.horse
            );
            lanes = Util.range(stable.length);
            Util.shuffle(lanes);
            this.addSprites({
                set: stable
            });

            // Position the horses on their marks.
            stable.forEach(function (horse, i) {
                horse.pos.x = 0;
                horse.pos.y = lanes[i] * 28 + 40;
            });

            // Begin the countdown.
            count(4)();
            this.base.start();
        },
        race: function () {
            stable.forEach(function (horse) {
                horse.race();
            });
        },
        endRace: function (playerWon, winner) {
            var that = this,
                resultSprite = playerWon ? result.win : result.lose;
            stable.forEach(function (horse) {
                horse.speed.x = 0;
            });
            this.addSprites({
                set: resultSprite
            });
            global.setTimeout(function () {
                that.removeSprite(resultSprite);
                stable.forEach(function (horse) {
                    that.removeSprite(horse);
                });
                player.horse.resetScale();
                $.Game.screen('track').stop();
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
