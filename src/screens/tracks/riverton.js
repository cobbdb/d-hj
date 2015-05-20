var Track = require('../track.js'),
    Horse = require('../../sprites/horse.js'),
    player = require('../../player.js'),
    HorseStats = require('../../horse-stats.js');

module.exports = Track({
    name: 'riverton',
    horses: [
        Horse({
            stats: HorseStats({
                body: 2
            })
        })
    ]
});
