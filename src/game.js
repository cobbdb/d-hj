var $ = require('dragonjs');

$.addFont('Wonder', {
    src: '8-bit-wonder.TTF'
});
console.debug('game.js', 'loadAssets()');
$.loadAssets(function () {
    $.debug();
    console.debug('game.js', 'addScreens()');
    $.addScreens([
        require('./screens/gear.js'),
        require('./screens/train.js'),
        require('./screens/care.js')
    ]);
});
