var $ = require('dragonjs');

$.pipeline.add.font('Wonder', {
    src: '8-bit-wonder.TTF'
});

$.start([
    require('./screens/gear.js'),
    require('./screens/train.js'),
    require('./screens/care.js')
], true);
