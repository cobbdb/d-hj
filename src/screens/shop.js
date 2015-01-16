var $ = require('dragonjs');

module.exports = $.Screen({
    name: 'shop',
    spriteSet: [
        require('../sprites/close-shop.js'),
        require('../sprites/ex2.js')
    ],
    depth: -1
});
