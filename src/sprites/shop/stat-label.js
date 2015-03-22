var $ = require('dragonjs'),
    player = require('../../player.js'),
    race = require('../buttons/race.js'),
    open = require('../buttons/open-care.js'),
    cwidth = $.canvas.width,
    cheight = $.canvas.height,
    center = (cwidth - race.realWidth - open.realWidth) / 2 + open.realWidth,
    margin = cwidth * 0.01,
    grid = {
        horse: {
            body: {
                name: 'Body',
                pos: $.Point(open.realWidth + margin, cheight * 0.1),
                side: 'left'
            },
            mind: {
                name: 'Mind',
                pos: $.Point(open.realWidth + margin, cheight * 0.2),
                side: 'left'
            },
            health: {
                name: 'Health',
                pos: $.Point(open.realWidth + margin, cheight * 0.3),
                side: 'left'
            }
        },
        jockey: {
            body: {
                name: 'Body',
                pos: $.Point(race.pos.x - margin, cheight * 0.1),
                side: 'right'
            },
            mind: {
                name: 'Mind',
                pos: $.Point(race.pos.x - margin, cheight * 0.2),
                side: 'right'
            },
            temper: {
                name: 'Temper',
                pos: $.Point(race.pos.x - margin, cheight * 0.3),
                side: 'right'
            }
        }
    };

module.exports = function (type, name) {
    return $.ui.Label({
        text: grid[type][name].name + ' ' + player[type].adjStats[name],
        pos: grid[type][name].pos,
        style: function (ctx) {
            ctx.font = '12px Wonder';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = grid[type][name].side;
            ctx.fillStyle = 'black';
        }
    }).extend({
        update: function () {
            this.text = grid[type][name].name + ' ' + player[type].adjStats[name];
        }
    });
};
