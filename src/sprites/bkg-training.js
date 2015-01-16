var $ = require('dragonjs');

module.exports = $.Sprite({
    name: 'bkg-training',
    strips: {
        'bkg-training': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'bkg-training.png'
            }),
            size: $.Dimension(834, 520)
        })
    },
    startingStrip: 'bkg-training',
    depth: 20,
    size: $.canvas
});
