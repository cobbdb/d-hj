var $ = require('dragonjs'),
    riverton = require('./screens/tracks/riverton.js');

$.pipeline.add.font('Wonder', {
    src: '8-bit-wonder.TTF'
});

$.addScreens([
    require('./screens/gear.js'),
    require('./screens/train.js'),
    require('./screens/care.js')
]);
$.start(true);
