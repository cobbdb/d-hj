var $ = require('dragonjs'),
    player = require('../player.js'),
    LaneOrdering = require('../lane-ordering.js');

/**
 * @param {Array of Functions} opts.laneFactories
 */
module.exports = function (opts) {
    var items = [],
        lanes = [],
        laneOrdering = LaneOrdering(opts.laneFactories.length);

    // Setup the lanes.
    opts.laneFactories.forEach(function (factory, i) {
        var lane = factory(laneOrdering[i]);
        lanes.push(lane);
        items = items.concat(
            lane.getSprites()
        );
    });

    return $.Screen({
        name: 'track',
        collisions: require('../collisions/racetrack.js'),
        sprites: lanes.concat(items),
        depth: 0,
        on: {
            $added: function () {
                $.addScreens([
                    require('./startrace.js'),
                    require('./raceresult.js')
                ]);
                this.start();
            }
        }
    }).extend({
        trackLength: 0,
        race: function () {
            lanes.forEach(function (lane) {
                lane.race(this.trackLength);
            }, this);
        },
        /**
         * @param {Boolean} playerWon
         * @param {Horse} winner
         */
        endRace: function (playerWon, winner) {
            lanes.forEach(function (lane) {
                lane.pause();
            });
            $.screen('raceresult').start(playerWon);
            $.setTimeout(function () {
                player.horse.endRace();

                $.screen('raceresult').stop();
                $.removeScreen('raceresult');

                $.removeScreen('track');
                $.screen('train').start();
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
