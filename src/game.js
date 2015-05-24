var $ = require('dragonjs'),
    riverton = require('./screens/tracks/riverton.js');

global.Cocoon.Utils.setAntialias(false);
$.canvas.ctx.webkitImageSmoothingEnabled = false;
$.canvas.ctx.mozImageSmoothingEnabled = false;
$.canvas.ctx.imageSmoothingEnabled = false;

$.Font.load({
    name: 'Wonder',
    src: '8-bit-wonder.TTF'
});
$.Game.addScreens([
    require('./screens/gear.js'),
    require('./screens/train.js'),
    require('./screens/care.js'),
    require('./screens/startrace.js'),
    require('./screens/raceresult.js'),
    riverton
]);
/*$.Game.currentTrack = riverton;
$.Game.loadTrack = function (track) {
    this.currentTrack.stop();
    this.currentTrack = track;
    this.currentTrack.start();
};*/
$.Game.run(true, true);
