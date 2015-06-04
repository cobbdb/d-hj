var $ = require('dragonjs');

module.exports = function (opts) {
    return $.Sprite({
        name: 'lane-item',
        collisionSets: [
            require('../../../collisions/racetrack.js')
        ],
        mask: $.Rectangle(
            $.Point(),
            $.Dimension(64, 64)
        ),
        strips: {
            'lane-item': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: 'lane-item.png'
                }),
                start: $.Point(10, 10),
                size: $.Dimension(64, 64),
                frames: 5,
                speed: 10
            })
        },
        startingStrip: 'lane-item',
        pos: $.Point(100, 100),
        depth: 2,
        on: {
            'colliding/screentap': function () {
            }
        }
    }).extend({
        update: function () {
            this.base.update();
        }
    });
};
