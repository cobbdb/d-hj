var $ = require('dragonjs'),
    player = require('../player.js'),
    LaneOrdering = require('../lane-ordering.js');

/**
 * @param {Array of Functions} opts.laneFactories
 */
module.exports = function (opts) {
    var items = [],
        lanes = [],
        lane, factory, i, len = opts.laneFactories.length,
        laneOrdering = LaneOrdering(len);

    // Setup the lanes.
    for (i = 0; i < len; i += 1) {
        factory = opts.laneFactories[i];
        lane = factory(laneOrdering[i]);
        lanes.push(lane);
        $.concatLeft(
            items,
            lane.getSprites()
        );
    }

    return $.Screen({
        name: 'track',
        collisions: require('../collisions/racetrack.js'),
        sprites: $.concat(lanes, items),
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
            var i, len = lanes.length;
            for (i = 0; i < len; i += 1) {
                lanes[i].race(this.trackLength);
            }
        },
        /**
         * @param {Boolean} playerWon
         * @param {Horse} winner
         */
        endRace: function (playerWon, winner) {
            var i, len = lanes.length;
            for (i = 0; i < len; i += 1) {
                lanes[i].pause();
            }

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
            $.canvas.clear('#67fb04');
            this.base.draw(ctx);
        }
    });
};
