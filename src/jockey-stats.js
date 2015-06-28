/**
 * @class JockeyStats
 */
module.exports = function (opts) {
    opts = opts || {};
    return {
        body: opts.body || 1,
        mind: opts.mind || 1,
        temper: opts.temper || 1,
        clone: function () {
            return Stats(this);
        }
    };
};
