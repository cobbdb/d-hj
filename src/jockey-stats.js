function Stats(opts) {
    opts = opts || {};
    return {
        size: opts.size || 1,
        temper: opts.temper || 1,
        smarts: opts.smarts || 1,
        clone: function () {
            return Stats(this);
        }
    };
}

module.exports = Stats;
