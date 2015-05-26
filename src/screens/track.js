var BaseClass = require('baseclassjs'),
    $ = require('dragonjs'),
    player = require('../player.js'),
    Util = require('../util.js'),
    LaneName = require('../sprites/track/lanename.js');

/**
 */
module.exports = function (opts) {
    var stable = [],
        lanenames = [];

    return $.Screen({
        name: 'track',
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: [
        ],
        depth: 0
    }).extend({
        trackLength: 0,
        buildStable: BaseClass.Abstract,
        getStable: function () {
            return stable;
        },
        start: function () {
            var lanes;

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
                horse.pos.x = 20;
                horse.pos.y = lanes[i] * 30 + 40;
                lanenames[i] = LaneName({
                    name: i + 1,
                    longname: horse.showname,
                    pos: $.Point(2, i * 30 + 40)
                });
            });
            this.addSprites({
                set: lanenames
            });

            $.Game.screen('startrace').start();
            this.base.start();
        },
        race: function () {
            var length = this.trackLength;
            stable.forEach(function (horse) {
                horse.race(length);
            });
        },
        endRace: function (playerWon, winner) {
            var that = this;
            $.Game.screen('raceresult').start(playerWon);
            stable.forEach(function (horse, i) {
                horse.speed.x = 0;
                lanenames[i].pause();
            });
            global.setTimeout(function () {
                stable.forEach(function (horse, i) {
                    that.removeSprite(horse);
                    that.removeSprite(lanenames[i]);
                });
                player.horse.endRace();
                $.Game.screen('raceresult').stop();
                that.stop();
                $.Game.screen('train').start();
            }, 2000);
            this.pause();
        },
        draw: function (ctx) {
            ctx.fillStyle = '#67fb04';
            ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
            this.base.draw(ctx);
        }
    });
};
