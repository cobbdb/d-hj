/**
 * @class StatGroup
 * @param {Function} Core
 */
module.exports = function (Core) {
    var modifiers = {};
    var group = {
        core: null,
        adj: null,
        reset: function () {
            group.adj = group.core.clone();
            modifiers = {};
        },
        refresh: function () {
            var name, mod;
            group.adj = group.core.clone();
            for (name in modifiers) {
                mod = modifiers[name];
                if (mod) {
                    adj = mod(adj);
                }
            }
        },
        modifier: {
            add: function (name, mod) {
                modifiers[name] = mod;
                group.refresh();
            },
            remove: function (name) {
                modifiers[name] = false;
                group.refresh();
            }
        }
    };
    group.core = Core(group.refresh);
    group.adj = Core(group.refresh);
    return group;
};
