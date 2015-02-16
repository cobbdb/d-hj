var $ = require('dragonjs');

module.exports = function (opts) {
    return $.ui.Slider({
        src: {
            lane: 'slider-lane.png',
            knob: 'slider-knob.png'
        },
        pos: opts.pos,
        size: $.Dimension(110, 16),
        onslide: opts.onslide
    });
};
