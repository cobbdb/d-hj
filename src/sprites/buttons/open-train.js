var $ = require('dragonjs'),
    upimg = $.pipeline.add.image('buttons/train.png'),
    downimg = $.pipeline.add.image('buttons/train.down.png'),
    self;

module.exports = function () {
    self = self || $.ui.Button({
        name: 'open-train',
        pos: $.Point(0, $.canvas.height * 0.32),
        size: $.Dimension(
            $.canvas.width * 0.1,
            $.canvas.height * 0.36
        ),
        up: {
            image: upimg
        },
        down: {
            image: downimg
        },
        onpress: function () {
            $.screen('gear').stop();
            $.screen('care').stop();
            $.screen('train').start();
            this.pause();
            require('./open-gear.js')().start();
            require('./open-care.js')().start();
        }
    });
    return self;
};
