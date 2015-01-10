function Stats(opts) {
    opts = opts || {};
    return {
        speed: opts.speed || 1,
        jump: opts.jump || 1,
        strength: opts.strength || 1,
        smarts: opts.smarts || 1,
        health: opts.health || 1,
        scale: function (mod) {
            return Stats({
                speed: this.speed * (mod.speed || 1),
                jump: this.jump * (mod.jump || 1),
                strength: this.strength * (mod.strength || 1),
                smarts: this.smarts * (mod.smarts || 1),
                health: this.health * (mod.health || 1)
            });
        }
    };
}

module.exports = Stats;
