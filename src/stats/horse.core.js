module.exports = function (opts) {
    var set;
    opts = opts || {};
    set = {
        body: opts.body || 500,
        mind: opts.mind || 1,
        health: opts.health || 1
    };
    return function (refresh) {
        return {
            get body () {
                return set.body;
            },
            set body (newval) {
                set.body = newval;
                refresh();
            },
            get mind () {
                return set.mind;
            },
            set mind (newval) {
                set.mind = newval;
                refresh();
            },
            get health () {
                return set.health;
            },
            set health (newval) {
                set.health = newval;
                refresh();
            },
            clone: function () {
                return module.exports(this)(refresh);
            }
        };
    };
};
