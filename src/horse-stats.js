function Stats(opts) {
    opts = opts || {};
    return {
        body: opts.body || 1,
        mind: opts.mind || 1,
        health: opts.health || 1,
        clone: function () {
            return Stats(this);
        }
    };
}

module.exports = Stats;
