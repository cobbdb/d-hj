var $ = require('dragonjs'),
    $ui = require('dragon-ui'),
    player = require('../player.js'),
    race = require('../sprites/buttons/race.js'),
    buttons = {
        horse: [
            require('../sprites/buttons/train-speed.js'),
            require('../sprites/buttons/train-strength.js'),
            require('../sprites/buttons/train-jump.js'),
            require('../sprites/buttons/train-smarts.js')
        ],
        jockey: [
            require('../sprites/buttons/train-jsmarts.js'),
            require('../sprites/buttons/train-size.js'),
            require('../sprites/buttons/train-temper.js')
        ]
    },
    allbuttons = [].
        concat(buttons.horse).
        concat(buttons.jockey);

module.exports = $.Screen({
    name: 'training',
    spriteSet: [
        //require('../sprites/bkg-training.js'),
        require('../sprites/buttons/open-shop.js'),
        //require('../sprites/stats.js'),
        race,
        $ui.Slider({
            src: {
                lane: 'slider-lane.png',
                knob: 'slider-knob.png'
            },
            pos: $.Point(70, 150),
            size: $.Dimension(110, 16),
            collisions: $.collisions,
            slide: function (val) {
                global.console.log('sliding', val);
            }
        })
    ],//.concat(allbuttons),
    one: {
        ready: function () {
            this.start();
        }
    },
    depth: 0
}).extend({
    draw: function (ctx) {
        var grd = ctx.createRadialGradient(
            $.canvas.width * (1 - race.width) / 2,
            $.canvas.height * 0.05,
            $.canvas.width * 0.1,
            $.canvas.width * (1 - race.width) / 2,
            $.canvas.height * 0.05,
            $.canvas.width
        );
        grd.addColorStop(0, '#dfd3c8');
        grd.addColorStop(1, '#8f8370');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0,
            $.canvas.width * (1 - race.width),
            $.canvas.height
        );
        this.base.draw(ctx);
    }
});
