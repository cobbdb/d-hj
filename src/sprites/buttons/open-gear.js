var $ = require('dragonjs');

module.exports = $.ui.Button({
    name: 'open-gear',
    pos: $.Point(0, 0),
    size: $.Dimension(
        $.canvas.width * 0.1,
        $.canvas.height * 0.32
    ),
    up: {
        image: $.image('buttons/gear.png')
    },
    down: {
        iamge: $.image('buttons/gear.down.png')
    },
    onpress: function () {
        $.screen('train').stop();
        $.screen('care').stop();
        $.screen('gear').start();
        this.pause();
        require('./open-train.js').start();
        require('./open-care.js').start();
    }
});
