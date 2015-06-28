module.exports = function (opts) {
    var set;
    opts = opts || {};
    set = {
        body: opts.body || 120,
        mind: opts.mind || 1,
        temper: opts.temper || 1
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
            get temper () {
                return set.health;
            },
            set temper (newval) {
                set.temper = newval;
                refresh();
            },
            clone: function () {
                return module.exports(this)(refresh);
            }
        };
    };
};
