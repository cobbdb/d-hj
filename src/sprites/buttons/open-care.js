var $ = require('dragonjs'),
    upimg = $.pipeline.add.image('buttons/care.png'),
    downimg = $.pipeline.add.image('buttons/care.down.png'),
    height = $.canvas.height * 0.32,
    width = 0.1,
    self;

module.exports = function () {
    self = self || $.ui.Button({
        name: 'open-care',
        pos: $.Point(0, $.canvas.height - height),
        size: $.Dimension(
            $.canvas.width * width,
            height
        ),
        up: {
            image: upimg
        },
        down: {
            image: downimg
        },
        onpress: function () {
            $.screen('train').stop();
            $.screen('gear').stop();
            $.screen('care').start();
            this.pause();
            require('./open-gear.js')().start();
            require('./open-train.js')().start();
        }
    }).extend({
        width: width,
        realWidth: $.canvas.width * width
    });
    return self;
};
