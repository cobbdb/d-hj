var $ = require('dragonjs');

$.addFont('Wonder', {
    src: '8-bit-wonder.TTF'
});

$.loadAssets(function () {
    $.debug();
    $.addScreens([
        require('./screens/gear.js'),
        require('./screens/train.js'),
        require('./screens/care.js')
    ]);
});
