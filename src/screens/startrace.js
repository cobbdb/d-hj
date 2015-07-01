var $ = require('dragonjs'),
    countdown = require('../sprites/track/countdown.js');

module.exports = $.Screen({
    name: 'startrace',
    sprites: countdown,
    depth: 10,
    on: {
        ready: function () {
            this.start();
        }
    }
}).extend({
    start: function () {
        var that = this;
        function count(time) {
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
                        that.stop();
                    }, 1000);
                    $.screen('track').race();
                }
            };
        }
        // Begin the countdown.
        count(4)();
        this.base.start();
    }
});
