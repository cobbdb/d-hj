var $ = require('dragonjs'),
    upimg = $.pipeline.add.image('buttons/gear.png'),
    downimg = $.pipeline.add.image('buttons/gear.down.png'),
    self;

module.exports = function () {
    self = self || $.ui.Button({
        name: 'open-gear',
        pos: $.Point(0, 0),
        size: $.Dimension(
            $.canvas.width * 0.1,
            $.canvas.height * 0.32
        ),
        up: {
            image: upimg
        },
        down: {
            iamge: downimg
        },
        onpress: function () {
            $.screen('train').stop();
            $.screen('care').stop();
            $.screen('gear').start();
            this.pause();
            require('./open-train.js')().start();
            require('./open-care.js')().start();
        }
    });
    return self;
};
