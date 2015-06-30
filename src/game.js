var $ = require('dragonjs'),
    Gear = require('./screens/gear.js'),
    Train = require('./screens/train.js'),
    Care = require('./screens/care.js');

$.pipeline.add.font('Wonder', {
    src: '8-bit-wonder.TTF'
});

$.start(function () {
    return [
        Gear(),
        Train(),
        Care()
    ];
}, true);
