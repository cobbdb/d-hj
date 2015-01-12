module.exports = {
    none: function () {},
    flu: function (set) {
        set.speed *= 0.8;
        set.jump *= 0.8;
        set.strength *= 0.8;
    },
    thrush: function (set) {
        set.speed *= 0.2;
    },
    tetanus: function () {},
    rainRot: function () {},
    swampFever: function () {}
};
