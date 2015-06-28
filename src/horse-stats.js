/**
 * @class HorseStats
 */
module.exports = function (opts) {
    opts = opts || {};
    return {
        body: opts.body || 120,
        mind: opts.mind || 1,
        health: opts.health || 1,
        clone: function () {
            return module.exports(this);
        }
    };
};
