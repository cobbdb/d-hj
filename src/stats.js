function Stats() {
    return {
        speed: 1,
        jump: 0,
        strength: 0,
        smarts: 0,
        health: 100,
        modify: function (mod) {
            var updated = Stats();
            updated.speed *= mod.speed;
            updated.jump *= mod.jump;
            updated.strength *= mod.strength;
            updated.smarts *= mod.smarts;
            updated.health *= mod.health;
            return updated;
        }
    };
}

module.exports = Stats;
