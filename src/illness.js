module.exports = {
    none: function () {},
    flu: function (stats) {
        stats.speed *= 0.8;
        stats.jump *= 0.8;
        stats.strength *= 0.8;
    },
    thrush: function (stats) {},
    tetanus: function (stats) {},
    rainRot: function (stats) {},
    swampFever: function (stats) {}
};
