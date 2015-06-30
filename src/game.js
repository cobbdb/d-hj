var $ = require('dragonjs');

$.addFont('Wonder', {
    src: '8-bit-wonder.TTF'
});

$.start(function () {
    return [
        require('./screens/gear.js'),
        require('./screens/train.js'),
        require('./screens/care.js')
    ];
}, true);
