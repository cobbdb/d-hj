var $ = require('dragonjs'),
    riverton = require('./screens/tracks/riverton.js');

global.Cocoon.Utils.setAntialias(false);
$.canvas.ctx.webkitImageSmoothingEnabled = false;
$.canvas.ctx.mozImageSmoothingEnabled = false;
$.canvas.ctx.imageSmoothingEnabled = false;

$.pipeline.add.font({
    name: 'Wonder',
    src: '8-bit-wonder.TTF'
});

$.addScreens([
    require('./screens/gear.js'),
    require('./screens/train.js'),
    require('./screens/care.js')
]);
$.start(true);
