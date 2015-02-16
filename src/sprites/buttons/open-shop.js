var $ = require('dragonjs'),
    race = require('./race.js'),
    menu = require('../close-shop.js'),
    margin = {
        top: 0.25
    };

module.exports = $.ui.Button({
    pos: $.Point(
        ($.canvas.width - race.size.width) / 2 - ($.canvas.width * 0.3) / 2,
        $.canvas.height * margin.top
    ),
    size: $.Dimension(
        $.canvas.width * 0.3,
        $.canvas.height * (menu.margin.top - margin.top)
    ),
    up: {
        src: 'buttons/gear.png',
        size: $.Dimension(35, 11)
    },
    onpress: function () {
        $.Game.screen('training').pause();
        $.Game.screen('shop').start();
    }
});
