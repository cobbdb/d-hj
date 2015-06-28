var $ = require('dragonjs'),
    riverton = require('./screens/tracks/riverton.js');

global.Cocoon.Utils.setAntialias(false);
$.canvas.ctx.webkitImageSmoothingEnabled = false;
$.canvas.ctx.mozImageSmoothingEnabled = false;
$.canvas.ctx.imageSmoothingEnabled = false;

$.addScreens([
    require('./screens/gear.js'),
    require('./screens/train.js'),
    require('./screens/care.js')
]);
/*$.currentTrack = riverton;
$.loadTrack = function (track) {
    this.currentTrack.stop();
    this.currentTrack = track;
    this.currentTrack.start();
};*/
$.load({
    debug: true,
    font: {
        name: 'Wonder',
        src: '8-bit-wonder.TTF'
    },
    image: {
        mudpit: 'mudpit.png',
        haybale: 'haybale.png'
    }
});
