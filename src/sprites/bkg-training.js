var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet;

module.exports = Sprite({
    name: 'bkg-training',
    strips: {
        'bkg-training': AnimationStrip({
            sheet: SpriteSheet({
                src: 'bkg-training.png'
            }),
            size: Dimension(834, 520)
        })
    },
    startingStrip: 'bkg-training',
    depth: 20,
    size: Dragon.Game.canvas
});
