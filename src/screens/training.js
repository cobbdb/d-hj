var $ = require('dragonjs'),
    player = require('../player.js'),
    race = require('../sprites/buttons/race.js'),
    Slider = require('../sprites/shop/slider.js'),
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
        concat(buttons.jockey),
    slide = {
        margin: {
            x: 70
        }
    };

module.exports = $.Screen({
    name: 'training',
    spriteSet: [
        require('../sprites/buttons/open-shop.js'),
        race,
        Slider({
            pos: $.Point(
                ($.canvas.width - race.size.width) / 2 - slide.margin.x,
                $.canvas.height * 0.5
            ),
            onslide: function (val) {
                console.debug('sliding', 'stat A', val);
            }
        }),
        Slider({
            pos: $.Point(
                ($.canvas.width - race.size.width) / 2 - slide.margin.x,
                $.canvas.height * 0.7
            ),
            onslide: function (val) {
                console.debug('sliding', 'stat B', val);
            }
        }),
        Slider({
            pos: $.Point(
                ($.canvas.width - race.size.width) / 2 - slide.margin.x,
                $.canvas.height * 0.9
            ),
            onslide: function (val) {
                console.debug('sliding', 'stat C', val);
            }
        }),
        Slider({
            pos: $.Point(
                ($.canvas.width - race.size.width) / 2 + slide.margin.x,
                $.canvas.height * 0.5
            ),
            onslide: function (val) {
                console.debug('sliding', 'stat D', val);
            }
        }),
        Slider({
            pos: $.Point(
                ($.canvas.width - race.size.width) / 2 + slide.margin.x,
                $.canvas.height * 0.7
            ),
            onslide: function (val) {
                console.debug('sliding', 'stat E', val);
            }
        }),
        Slider({
            pos: $.Point(
                ($.canvas.width - race.size.width) / 2 + slide.margin.x,
                $.canvas.height * 0.9
            ),
            onslide: function (val) {
                console.debug('sliding', 'stat F', val);
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
