function Stats(opts) {
    opts = opts || {};
    return {
        speed: opts.speed || 1,
        jump: opts.jump || 1,
        strength: opts.strength || 1,
        smarts: opts.smarts || 1,
        health: opts.health || 1,
        clone: function () {
            return Stats(this);
        }
    };
}

module.exports = Stats;
