/**
 * @class StatGroup
 * @param {HorseStats|JockeyStats} opts.core Set of
 * either horse or jockey stats.
 */
module.exports = function (opts) {
    var modifiers = {};
    return {
        core: opts.core,
        addModifier: function (name, mod) {
            modifiers[name] = mod;
        },
        removeModifier: function (name) {
            modifiers[name] = false;
        },
        get: function (name) {
            
        }
    };
};
