var $ = require('dragonjs'),
    countdown = require('../sprites/track/countdown.js');

module.exports = $.Screen({
    name: 'startrace',
    sprites: countdown,
    depth: 10,
    on: {
        $added: function () {
            this.start();
        }
    }
}).extend({
    start: function () {
        function count(time) {
            return function () {
                if (time > 0) {
                    // Keep counting down to zero.
                    countdown.text = time;
                    $.setTimeout(
                        count(time - 1),
                        1000
                    );
                } else {
                    // Start the race and show final count frame.
                    countdown.text = "and they're off!";
                    $.setTimeout(function () {
                        $.screen('startrace').stop();
                        $.removeScreen('startrace');
                    }, 1000);
                    $.screen('track').race();
                }
            };
        }
        // Begin the countdown.
        count(1)();
        this.base.start();
    }
});
