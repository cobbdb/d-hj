var $ = require('dragonjs'),
    StartRace = require('./startrace.js'),
    RaceResult = require('./raceresult.js'),
    player = require('../player.js'),
    LaneOrdering = require('../lane-ordering.js');

/**
 * @param {Array of Lanes} opts.lanes
 */
module.exports = function (opts) {
    var items = [],
        lanes = opts.lanes,
        laneOrdering = LaneOrdering(lanes.length);

    // Setup the lanes.
    lanes.forEach(function (lane, i) {
        lane.order(laneOrdering[i]);
        items = items.concat(
            lane.getSprites()
        );
    });

    return $.Screen({
        name: 'track',
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: lanes.concat(items),
        depth: 0,
        on: {
            ready: function () {
                this.start();
            }
        }
    }).extend({
        trackLength: 0,
        start: function () {
            $.screen('startrace').start();
            this.base.start();
        },
        load: function (cb) {
            $.addScreens([
                StartRace(),
                RaceResult()
            ]);
            this.base.load(cb);
        },
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
            global.setTimeout(function () {
                player.horse.endRace();
                $.removeScreen('startrace');
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
