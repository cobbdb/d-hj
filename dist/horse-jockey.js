(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function () {
    throw Error('[BaseClass] Abstract method was called without definition.');
};

},{}],2:[function(require,module,exports){
var rebind = require('./rebind.js');

function contructor(root) {
    root.extend = function (child) {
        var key, base = {
            base: root.base
        };
        child = child || {};

        for (key in root) {
            if (typeof root[key] === 'function') {
                base[key] = root[key].bind(root);
            }
        }
        for (key in child) {
            if (typeof child[key] === 'function') {
                root[key] = rebind(key, root, base, child);
            } else {
                root[key] = child[key];
            }
        }

        root.base = base;
        return root;
    };

    root.implement = function () {
        var i, len = arguments.length;
        for (i = 0; i < len; i += 1) {
            arguments[i](root);
        }
        return root;
    };

    return root;
}

contructor.Abstract = require('./abstract.js');
contructor.Stub = require('./stub.js');
contructor.Interface = require('./interface.js');

module.exports = contructor;

},{"./abstract.js":1,"./interface.js":3,"./rebind.js":4,"./stub.js":5}],3:[function(require,module,exports){
module.exports = function (child) {
    return function (root) {
        var key;
        for (key in child) {
            root[key] = child[key];
        }
        return root;
    };
};

},{}],4:[function(require,module,exports){
module.exports = function (key, root, base, self) {
    return function () {
        var out,
            oldbase = root.base;

        // Rebind base and self for this specific method.
        root.base = base;
        root.self = self;
        out = self[key].apply(root, arguments);

        // Restore the original base object.
        root.base = oldbase;
        return out;
    };
};

},{}],5:[function(require,module,exports){
module.exports = function () {};

},{}],6:[function(require,module,exports){
module.exports=require(1)
},{"F:\\wamp\\www\\horse-jockey\\node_modules\\baseclassjs\\src\\abstract.js":1}],7:[function(require,module,exports){
module.exports=require(2)
},{"./abstract.js":6,"./interface.js":8,"./rebind.js":9,"./stub.js":10,"F:\\wamp\\www\\horse-jockey\\node_modules\\baseclassjs\\src\\baseclass.js":2}],8:[function(require,module,exports){
module.exports=require(3)
},{"F:\\wamp\\www\\horse-jockey\\node_modules\\baseclassjs\\src\\interface.js":3}],9:[function(require,module,exports){
module.exports=require(4)
},{"F:\\wamp\\www\\horse-jockey\\node_modules\\baseclassjs\\src\\rebind.js":4}],10:[function(require,module,exports){
module.exports=require(5)
},{"F:\\wamp\\www\\horse-jockey\\node_modules\\baseclassjs\\src\\stub.js":5}],11:[function(require,module,exports){
module.exports = function () {
    var i,
        str = arguments[0],
        len = arguments.length;
    for (i = 1; i < len; i += 1) {
        str = str.replace(/%s/, arguments[i]);
    }
    return str;
};

},{}],12:[function(require,module,exports){
(function (global){
/**
 * # Lumberjack
 * Set `localStorage.lumberjack` to `on` to enable logging.
 * @param {Boolean} enabled True to force logging regardless of
 * the localStorage setting.
 * @return {Object} A new Lumberjack.
 * @see GitHub-Page http://github.com/cobbdb/lumberjack
 */
module.exports = function (enabled) {
    var log,
        record = {},
        cbQueue = {},
        master = [],
        ls = global.localStorage || {};

    /**
     * ## log(channel, data)
     * Record a log entry for an channel.
     * @param {String} channel A string describing this channel.
     * @param {String|Object|Number|Boolean} data Some data to log.
     */
    log = function (channel, data) {
        var i, len, channel, entry;
        var channelValid = typeof channel === 'string';
        var dataType = typeof data;
        var dataValid = dataType !== 'undefined' && dataType !== 'function';
        if (ls.lumberjack !== 'on' && !enabled) {
            // Do nothing unless enabled.
            return;
        }
        if (channelValid && dataValid) {
            /**
             * All log entries take the form of:
             * ```javascript
             *  {
             *      time: // timestamp when entry was logged
             *      data: // the logged data
             *      channel: // channel of entry
             *      id: // id of entry in master record
             *  }
             * ```
             */
            entry = {
                time: new Date(),
                data: data,
                channel: channel,
                id: master.length
            };
            // Record the channel.
            record[channel] = record[channel] || []
            record[channel].push(entry);
            master.push(entry);

            // Perform any attached callbacks.
            cbQueue[channel] = cbQueue[channel] || [];
            len = cbQueue[channel].length;
            for (i = 0; i < len; i += 1) {
                cbQueue[channel][i](data);
            }
        } else {
            throw Error('Lumberjack Error: log(channel, data) requires an channel {String} and a payload {String|Object|Number|Boolean}.');
        }
    };

    /**
     * ## log.clear([channel])
     * Clear all data from a the log.
     * @param {String} [channel] Name of a channel.
     */
    log.clear = function (channel) {
        if (channel) {
            record[channel] = [];
        } else {
            record = {};
            master = [];
        }
    };

    /**
     * ## log.readback(channel, [pretty])
     * Fetch the log of an channel.
     * @param {String} channel A string describing this channel.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This channel's current record.
     */
    log.readback = function (channel, pretty) {
        var channelValid = typeof channel === 'string';
        if (channelValid) {
            if (pretty) {
                return JSON.stringify(record[channel], null, 4);
            }
            return record[channel] || [];
        }
        throw Error('log.readback(channel, pretty) requires an channel {String}.');
    };

    /**
     * ## log.readback.master([pretty])
     * Get a full readback of all channels' entries.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This log's master record.
     */
    log.readback.master = function (pretty) {
        if (pretty) {
            return JSON.stringify(master, null, 4);
        }
        return master;
    };

    /**
     * ## log.readback.channels([pretty])
     * Fetch list of log channels currently in use.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This log's set of used channels.
     */
    log.readback.channels = function (pretty) {
        var keys = Object.keys(record);
        if (pretty) {
            return JSON.stringify(keys);
        }
        return keys;
    };

    /**
     * ## log.on(channel, cb)
     * Attach a callback to run anytime a channel is logged to.
     * @param {String} channel A string describing this channel.
     * @param {Function} cb The callback.
     */
    log.on = function (channel, cb) {
        var channelValid = typeof channel === 'string';
        var cbValid = typeof cb === 'function';
        if (channelValid && cbValid) {
            cbQueue[channel] = cbQueue[channel] || [];
            cbQueue[channel].push(cb);
        } else {
            throw Error('log.on(channel, cb) requires an channel {String} and a callback {Function}.');
        }
    };

    /**
     * ## log.off(channel)
     * Disable side-effects for a given channel.
     * @param {String} channel A string describing this channel.
     */
    log.off = function (channel) {
        var channelValid = typeof channel === 'string';
        if (channelValid) {
            cbQueue[channel] = [];
        } else {
            throw Error('log.off(channel) requires an channel {String}.');
        }
    };

    /**
     * ## log.enable()
     * Activate logging regardless of previous settings.
     */
    log.enable = function () {
        enabled = true;
    };

    /**
     * ## log.disable()
     * Force logging off.
     */
    log.disable = function () {
        enabled = false;
    };

    return log;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
var Dimension = require('./dimension.js'),
    Point = require('./point.js'),
    log = require('./log.js');

/**
 * @param {SpriteSheet} opts.sheet
 * @param {Point} [opts.start] Defaults to (0,0). Point in the
 * sprite sheet of the first frame.
 * @param {Dimension} [opts.size] Defaults to (0,0). Size of
 * each frame in the sprite sheet.
 * @param {Number} [opts.frames] Defaults to 1. Number of
 * frames in this strip.
 * @param {Number} [opts.speed] Number of frames per second.
 * @param {Boolean} [opts.sinusoid] Defaults to false. True
 * to cycle the frames forward and backward in a sinusoid.
 */
module.exports = function (opts) {
    var timeLastFrame,
        timeSinceLastFrame = 0,
        updating = false,
        frames = opts.frames || 1,
        size = opts.size || Dimension(),
        start = opts.start || Point(),
        start = Point(
            size.width * start.x,
            size.height * start.y
        ),
        direction = 1;

    return {
        size: size,
        frame: 0,
        speed: opts.speed || 0,
        load: function (cb) {
            opts.sheet.load(cb);
        },
        start: function () {
            timeLastFrame = Date.now();
            updating = true;
        },
        /**
         * Pausing halts the update loop but
         * retains animation position.
         */
        pause: function () {
            updating = false;
        },
        /**
         * Stopping halts update loop and
         * resets the animation.
         */
        stop: function () {
            updating = false;
            timeSinceLastFrame = 0;
            this.frame = 0;
            direction = 1;
        },
        update: function () {
            var now, elapsed, timeBetweenFrames;

            if (updating && this.speed) {
                timeBetweenFrames = (1 / this.speed) * 1000;
                now = Date.now();
                elapsed = now - timeLastFrame;
                timeSinceLastFrame += elapsed;
                if (timeSinceLastFrame >= timeBetweenFrames) {
                    timeSinceLastFrame = 0;
                    this.nextFrame();
                }
                timeLastFrame = now;
            }
        },
        nextFrame: function () {
            this.frame += direction;
            if (opts.sinusoid) {
                if (this.frame % (frames - 1) === 0) {
                    direction *= -1;
                }
            } else {
                this.frame %= frames;
            }
            return this.frame;
        },
        /**
         * @param {Context2D} ctx Canvas 2D context.
         * @param {Point} pos Canvas position.
         * @param {Dimension} [scale] Defaults to (1,1).
         * @param {Number} [rotation] Defaults to 0.
         */
        draw: function (ctx, pos, scale, rotation) {
            var finalSize,
                offset = this.frame * size.width;
            scale = scale || Dimension(1, 1);
            rotation = rotation || 0;
            finalSize = Dimension(
                size.width * scale.width,
                size.height * scale.height
            );

            // Apply the canvas transforms.
            ctx.save();
            ctx.translate(
                pos.x + finalSize.width / 2,
                pos.y + finalSize.height / 2
            );
            ctx.rotate(rotation);

            // Draw the frame and restore the canvas.
            ctx.drawImage(opts.sheet,
                start.x + offset,
                start.y,
                size.width,
                size.height,
                -finalSize.width / 2,
                -finalSize.height / 2,
                finalSize.width,
                finalSize.height
            );
            ctx.restore();
        }
    };
};

},{"./dimension.js":23,"./log.js":32,"./point.js":34}],14:[function(require,module,exports){
/**
 * @param {String} opts.src
 * @param {Boolean} [opts.loop] Defaults to false.
 * @param {Number} [opts.volume] Defaults to 1. Volume
 * level between 0 and 1.
 * @param {Function} [opts.on.load]
 * @param {Function} [opts.on.play]
 * @param {Function} [opts.on.playing]
 * @param {Function} [opts.on.ended]
 * @return {Audio}
 */
module.exports = function (opts) {
    var audio = document.createElement('audio'),
        oldplay = audio.play;
    audio.loop = opts.loop || false;
    audio.volume = opts.volume || 1;

    /**
     * @param {Boolean} [force] Defaults to false. Force
     * immediate play from the start, even if the audio
     * is already playing.
     */
    audio.play = function (force) {
        if (force) {
            this.currentTime = 0;
        }
        oldplay.call(this);
    };
    /**
     * Pause playback and reset time index.
     */
    audio.stop = function () {
        this.pause();
        this.currentTime = 0;
    };

    opts.on = opts.on || {};
    audio.onloadeddata = opts.on.load;
    audio.onplay = opts.on.play;
    audio.onplaying = opts.on.playing;
    audio.onended = opts.on.ended;

    audio.src = 'assets/sound/' + opts.src;
    return audio;
};

},{}],15:[function(require,module,exports){
var mobile = require('./detect-mobile.js'),
    canvas = document.createElement('canvas');

if (mobile) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
} else {
    if (localStorage.drago === 'landscape') {
        canvas.width = 480;
        canvas.height = 320;
    } else {
        canvas.width = 320;
        canvas.height = 480;
    }
    canvas.style.border = '1px solid #000';
}

document.body.appendChild(canvas);
canvas.mobile = mobile;
canvas.ctx = canvas.getContext('2d');

module.exports = canvas;

},{"./detect-mobile.js":22}],16:[function(require,module,exports){
var Shape = require('./shape.js'),
    Vector = require('./vector.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js');

/**
 * @param {Point} [pos] Defaults to (0,0).
 * @param {Number} [rad] Defaults to 0.
 */
module.exports = function (pos, rad) {
    pos = pos || Point();
    rad = rad || 0;

    return Shape({
        pos: pos,
        name: 'circle',
        intersects: {
            rectangle: function (rect) {
                var vect,
                    pt = Point(this.x, this.y);

                if (this.x > rect.right) pt.x = rect.right;
                else if (this.x < rect.x) pt.x = rect.x;
                if (this.y > rect.bottom) pt.y = rect.bottom;
                else if (this.y < rect.y) pt.y = rect.y;

                vect = Vector(
                    this.x - pt.x,
                    this.y - pt.y
                );
                return vect.magnitude < this.radius;
            },
            circle: function (circ) {
                var vect = Vector(
                    circ.x - this.x,
                    circ.y - this.y
                );
                return vect.magnitude < this.radius + circ.radius;
            }
        }
    }).extend({
        radius: rad,
        width: rad * 2,
        height: rad * 2,
        top: pos.y - rad,
        right: pos.x + rad,
        bottom: pos.y + rad,
        left: pos.x - rad,
        draw: function (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
        },
        move: function (x, y) {
            this.x = x;
            this.y = y;
            this.top = y - this.radius;
            this.right = x + this.radius;
            this.bottom = y + this.radius;
            this.left = x - this.radius;
        },
        resize: function (rad) {
            this.radius = rad;
            this.width = rad * 2;
            this.height = rad * 2;
            this.top = this.y - rad;
            this.right = this.x + rad;
            this.bottom = this.y + rad;
            this.left = this.x - rad;
        }
    });
};

},{"./dimension.js":23,"./point.js":34,"./shape.js":38,"./vector.js":41}],17:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    Sprite = require('./sprite.js');

module.exports = function (opts) {
    return Sprite(opts).extend({
        load: function (cb) {
            cb();
        },
        start: BaseClass.Stub,
        pause: BaseClass.Stub,
        stop: BaseClass.Stub,
        update: BaseClass.Stub,
        draw: BaseClass.Stub
    });
};

},{"./sprite.js":39,"baseclassjs":7}],18:[function(require,module,exports){
var Counter = require('./id-counter.js'),
    EventHandler = require('./event-handler.js'),
    BaseClass = require('baseclassjs'),
    Rectangle = require('./rectangle.js'),
    Point = require('./point.js');

/**
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var activeCollisions = {},
        collisionsThisFrame = {},
        collisionSets = [],
        updated = false;

    if (opts.collisionSets) {
        collisionSets = [].concat(opts.collisionSets);
    }

    return BaseClass({
        id: Counter.nextId,
        name: opts.name,
        mask: opts.mask || Rectangle(),
        offset: opts.offset || Point(),
        move: function (pos) {
            this.mask.move(
                pos.x + this.offset.x,
                pos.y + this.offset.y
            );
        },
        intersects: function (mask) {
            return this.mask.intersects(mask);
        },
        update: function () {
            var that = this;
            if (!updated) {
                collisionSets.forEach(function (handler) {
                    handler.update(that);
                });
                updated = true;
            }
        },
        teardown: function () {
            updated = false;
            collisionsThisFrame = {};
        },
        addCollision: function (id) {
            activeCollisions[id] = true;
            collisionsThisFrame[id] = true;
        },
        removeCollision: function (id) {
            activeCollisions[id] = false;
        },
        clearCollisions: function () {
            activeCollisions = {};
        },
        isCollidingWith: function (id) {
            return activeCollisions[id] || false;
        },
        canCollideWith: function (id) {
            var self = this.id === id,
                already = collisionsThisFrame[id];
            return !self && !already;
        }
    }).implement(
        EventHandler({
            events: opts.on,
            singles: opts.one
        })
    );
};

},{"./event-handler.js":25,"./id-counter.js":29,"./point.js":34,"./rectangle.js":36,"baseclassjs":7}],19:[function(require,module,exports){
var Rectangle = require('./rectangle.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    canvas = require('./canvas.js');

/**
 * @param {String} opts.name
 * @param {Dimension} [opts.gridSize] Defaults to (1,1).
 */
module.exports = function (opts) {
    var i, j,
        collisionGrid = [],
        activeCollisions = [],
        gridSize = opts.gridSize || Dimension(1, 1);

    for (i = 0; i < gridSize.width; i += 1) {
        for (j = 0; j < gridSize.height; j += 1) {
            collisionGrid.push(
                Rectangle(
                    Point(
                        i / gridSize.width * canvas.width,
                        j / gridSize.height * canvas.height
                    ),
                    Dimension(
                        canvas.width / gridSize.width,
                        canvas.height / gridSize.height
                    )
                )
            );
        }
    }

    for (i = 0; i < collisionGrid.length; i += 1) {
        activeCollisions.push([]);
    }

    return {
        name: opts.name,
        draw: function (ctx, drawGrid) {
            if (drawGrid) {
                collisionGrid.forEach(function (partition) {
                    partition.draw(ctx);
                });
            }
            activeCollisions.forEach(function (set) {
                set.forEach(function (collidable) {
                    collidable.mask.draw(ctx);
                });
            });
        },
        clearCollisions: function () {
            var i, len = activeCollisions.length;
            for (i = 0; i < len; i += 1) {
                activeCollisions[i] = [];
            }
        },
        update: function (collidable) {
            var i, len = activeCollisions.length;
            for (i = 0; i < len; i += 1) {
                if (collidable.intersects(collisionGrid[i])) {
                    activeCollisions[i].push(collidable);
                }
            }
        },
        handleCollisions: function () {
            var i, set,
                len = activeCollisions.length;

            for (i = 0; i < len; i += 1) {
                set = activeCollisions[i];
                set.forEach(function (pivot) {
                    set.forEach(function (other) {
                        var intersects, colliding,
                            valid = pivot.canCollideWith(other.id);

                        if (valid) {
                            intersects = pivot.intersects(other.mask),
                            colliding = pivot.isCollidingWith(other.id);
                            /**
                             * (colliding) ongoing intersection
                             * (collide) first collided: no collide -> colliding
                             * (separate) first separated: colliding -> no collide
                             * (miss) ongoing separation
                             */
                            if (intersects) {
                                pivot.addCollision(other.id);
                                if (!colliding) {
                                    pivot.trigger('collide/' + other.name, other);
                                }
                                pivot.trigger('colliding/' + other.name, other);
                            } else {
                                if (colliding) {
                                    pivot.removeCollision(other.id);
                                    pivot.trigger('separate/' + other.name, other);
                                }
                                pivot.trigger('miss/' + other.name, other);
                            }
                        }
                    });
                });
            }
        },
        teardown: function () {
            this.clearCollisions();
        }
    };
};

},{"./canvas.js":15,"./dimension.js":23,"./point.js":34,"./rectangle.js":36}],20:[function(require,module,exports){
module.exports = {
    Shape: require('./shape.js'),
    Circle: require('./circle.js'),
    Rectangle: require('./rectangle.js'),

    Dimension: require('./dimension.js'),
    Point: require('./point.js'),
    Vector: require('./vector.js'),
    Polar: require('./polar.js'),

    FrameCounter: require('./frame-counter.js'),
    IdCounter: require('./id-counter.js'),
    Mouse: require('./mouse.js'),
    Keyboard: require('./keyboard.js'),

    EventHandler: require('./event-handler.js'),
    SpriteSheet: require('./spritesheet.js'),
    AnimationStrip: require('./animation-strip.js'),
    Audio: require('./audio.js'),
    Font: require('./font.js'),

    CollisionHandler: require('./collision-handler.js'),
    collisions: require('./dragon-collisions.js'),

    Game: require('./game.js'),
    canvas: require('./canvas.js'),
    Screen: require('./screen.js'),
    Collidable: require('./collidable.js'),
    Sprite: require('./sprite.js'),
    ClearSprite: require('./clear-sprite.js')
};

},{"./animation-strip.js":13,"./audio.js":14,"./canvas.js":15,"./circle.js":16,"./clear-sprite.js":17,"./collidable.js":18,"./collision-handler.js":19,"./dimension.js":23,"./dragon-collisions.js":24,"./event-handler.js":25,"./font.js":26,"./frame-counter.js":27,"./game.js":28,"./id-counter.js":29,"./keyboard.js":31,"./mouse.js":33,"./point.js":34,"./polar.js":35,"./rectangle.js":36,"./screen.js":37,"./shape.js":38,"./sprite.js":39,"./spritesheet.js":40,"./vector.js":41}],21:[function(require,module,exports){
module.exports = {
    show: {
        fps: function () {}
    }
};

},{}],22:[function(require,module,exports){
/**
 * @see https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
 */
module.exports = 'ontouchstart' in window;

},{}],23:[function(require,module,exports){
function Dimension(w, h) {
    return {
        width: w || 0,
        height: h || 0,
        clone: function () {
            return Dimension(this.width, this.height);
        },
        equals: function (other) {
            return (
                this.width === other.width &&
                this.height === other.height
            );
        },
        scale: function (scale) {
            return Dimension(
                this.width * scale,
                this.height * scale
            );
        }
    };
}

module.exports = Dimension;

},{}],24:[function(require,module,exports){
var CollisionHandler = require('./collision-handler.js'),
    Dimension = require('./dimension.js');

module.exports = CollisionHandler({
    name: 'dragon',
    gridSize: Dimension(4, 4)
});

},{"./collision-handler.js":19,"./dimension.js":23}],25:[function(require,module,exports){
var BaseClass = require('baseclassjs');

/**
 * @param {Object} [opts.events]
 * @param {Object} [opts.singles]
 */
module.exports = function (opts) {
    var events = {},
        singles = {},
        name;

    opts = opts || {};
    for (name in opts.events) {
        events[name] = [
            opts.events[name]
        ];
    }
    for (name in opts.singles) {
        singles[name] = [
            opts.singles[name]
        ];
    }

    return BaseClass.Interface({
        on: function (name, cb) {
            events[name] = events[name] || [];
            events[name].push(cb);
        },
        one: function (name, cb) {
            singles[name] = singles[name] || [];
            singles[name].push(cb);
        },
        off: function (name) {
            events[name] = [];
            singles[name] = [];
        },
        trigger: function (name, data) {
            var that = this;
            if (name in events) {
                events[name].forEach(function (cb) {
                    cb.call(that, data);
                });
            }
            if (name in singles) {
                singles[name].forEach(function (cb) {
                    cb.call(that, data);
                });
                singles[name] = [];
            }
        }
    });
};

},{"baseclassjs":7}],26:[function(require,module,exports){
var str = require('curb'),
    tpl = "@font-face{font-family:'%s';font-style:%s;font-weight:%s;src:url(assets/fonts/%s);unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2212,U+2215,U+E0FF,U+EFFD,U+F000}",
    cache = {};

module.exports = {
    /**
     * @param {String} opts.name
     * @param {String} [opts.style]
     * @param {String|Number} [opts.weight]
     * @param {String} opts.src
     */
    load: function (opts) {
        var style;
        if (!cache[opts.name]) {
            style = document.createElement('style');
            style.innerHTML = str(tpl,
                opts.name,
                opts.style || 'normal',
                opts.weight || '400',
                opts.src
            );
            document.body.appendChild(style);
            cache[opts.name] = true;
        }
    }
};

},{"curb":11}],27:[function(require,module,exports){
var timeSinceLastSecond = frameCountThisSecond = frameRate = 0,
    timeLastFrame = Date.now();

module.exports = {
    countFrame: function () {
        var timeThisFrame = Date.now(),
            elapsedTime = timeThisFrame - timeLastFrame;

        frameCountThisSecond += 1;
        timeLastFrame = timeThisFrame;

        timeSinceLastSecond += elapsedTime;
        if (timeSinceLastSecond >= 1000) {
            timeSinceLastSecond -= 1000;
            frameRate = frameCountThisSecond;
            frameCountThisSecond = 0;
        }
    },
    get frameRate () {
        return frameRate;
    },
    draw: function (ctx) {
        ctx.font = '30px Verdana';
        ctx.fillStyle = 'rgba(250, 50, 50, 0.5)';
        ctx.fillText(frameRate, 20, 50);
    }
};

},{}],28:[function(require,module,exports){
var CollisionHandler = require('./collision-handler.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Circle = require('./circle.js'),
    Rectangle = require('./rectangle.js'),
    Collidable = require('./collidable.js'),
    FrameCounter = require('./frame-counter.js'),
    Mouse = require('./mouse.js'),
    canvas = require('./canvas.js'),
    ctx = canvas.ctx,
    Counter = require('./id-counter.js'),
    log = require('./log.js'),
    dragonCollisions = require('./dragon-collisions.js'),
    debug = false,
    screens = [],
    screenMap = {},
    screensToAdd = [],
    screenRemoved = false,
    loadQueue = {},
    running = false,
    masks = {
        screentap: Collidable({
            name: 'screentap',
            mask: Circle(Point(), 8)
        }),
        screendrag: Collidable({
            name: 'screendrag',
            mask: Circle(Point(), 8)
        }),
        screenhold: Collidable({
            name: 'screenhold',
            mask: Circle(Point(), 8)
        }),
        screenedge: {
            top: Collidable({
                name: 'screenedge/top',
                mask: Rectangle(
                    Point(0, -9),
                    Dimension(canvas.width, 10)
                )
            }),
            right: Collidable({
                name: 'screenedge/right',
                mask: Rectangle(
                    Point(canvas.width - 1, 0),
                    Dimension(10, canvas.height)
                )
            }),
            bottom: Collidable({
                name: 'screenedge/bottom',
                mask: Rectangle(
                    Point(0, canvas.height - 1),
                    Dimension(canvas.width, 10)
                )
            }),
            left: Collidable({
                name: 'screenedge/left',
                mask: Rectangle(
                    Point(-9, 0),
                    Dimension(10, canvas.height)
                )
            })
        }
    };

Mouse.on.down(function () {
    masks.screentap.move(Mouse.offset);
    dragonCollisions.update(masks.screentap);
});

module.exports = {
    debug: require('./debug-console.js'),
    screen: function (name) {
        return screenMap[name];
    },
    /**
     * Loads screen into the game together
     * as a batch. None of the batch will be
     * loaded into the game until all screens
     * are ready.
     * @param {Array|Screen} set
     */
    addScreens: function (set) {
        var id;
        if (set) {
            set = [].concat(set);
            id = Counter.nextId;

            loadQueue[id] = set.length;
            set.forEach(function (screen) {
                screen.load(function () {
                    loadQueue[id] -= 1;
                    if (loadQueue[id] === 0) {
                        screensToAdd = screensToAdd.concat(set);
                    }
                });
            });
        }
    },
    removeScreen: function (screen) {
        screen.removed = true;
        screenRemoved = true;
    },
    /**
     * @param {Boolean} [debugMode] Defaults to false.
     */
    run: function (debugMode) {
        var that = this,
            step = function () {
                that.update();
                that.draw();
                that.teardown();
                FrameCounter.countFrame();
                if (running) {
                    window.requestAnimationFrame(step);
                }
            };

        debug = debugMode;
        if (debugMode) {
            window.Dragon = this;
        }

        if (!running) {
            running = true;
            window.requestAnimationFrame(step);
        }
    },
    kill: function () {
        running = false;
        screens.forEach(function (screen) {
            screen.stop();
        });
    },
    update: function () {
        if (Mouse.is.dragging) {
            masks.screendrag.move(Mouse.offset);
            dragonCollisions.update(masks.screendrag);
        } else if (Mouse.is.holding) {
            masks.screenhold.move(Mouse.offset);
            dragonCollisions.update(masks.screenhold);
        }
        dragonCollisions.update(masks.screenedge.top);
        dragonCollisions.update(masks.screenedge.right);
        dragonCollisions.update(masks.screenedge.bottom);
        dragonCollisions.update(masks.screenedge.left);

        // Update the screen.
        screens.forEach(function (screen) {
            screen.update();
        });

        // Settle screen tap events.
        dragonCollisions.handleCollisions();

        if (screensToAdd.length) {
            // Update the master screen list after updates.
            screensToAdd.forEach(function (screen) {
                screens.push(screen);
                if (screen.name) {
                    screenMap[screen.name] = screen;
                }
                screen.trigger('ready');
            });
            // Sort by descending sprite depths.
            screens.sort(function (a, b) {
                return b.depth - a.depth;
            });
            screensToAdd = [];
        }
    },
    draw: function () {
        screens.forEach(function (screen) {
            screen.draw(ctx, debug);
        });
        if (debug) {
            FrameCounter.draw(ctx);
            dragonCollisions.draw(ctx);
        }
    },
    teardown: function () {
        dragonCollisions.teardown();
        screens.forEach(function (screen) {
            screen.teardown();
        });
        if (screenRemoved) {
            // Remove any stale screens.
            screens = screens.filter(function (screen) {
                // true to keep, false to drop.
                return !screen.removed;
            });
            screenRemoved = false;
        }
    }
};

},{"./canvas.js":15,"./circle.js":16,"./collidable.js":18,"./collision-handler.js":19,"./debug-console.js":21,"./dimension.js":23,"./dragon-collisions.js":24,"./frame-counter.js":27,"./id-counter.js":29,"./log.js":32,"./mouse.js":33,"./point.js":34,"./rectangle.js":36}],29:[function(require,module,exports){
var counter = 0;

module.exports = {
    get lastId () {
        return counter;
    },
    get nextId () {
        counter += 1;
        return counter;
    }
};

},{}],30:[function(require,module,exports){
module.exports = function (src) {
    var img = new Image();
    img.ready = false;
    img.cmd = [];

    img.processLoadEvents = function () {
        this.cmd.forEach(function (cb) {
            cb(img);
        });
        this.cmd = [];
    };

    img.onload = function () {
        this.ready = true;
        this.processLoadEvents();
    };

    /**
     * @param {Function} [cb] Defaults to noop. Callback
     * for onload event.
     */
    img.load = function (cb) {
        cb = cb || function () {};
        if (this.ready) {
            cb(img);
        } else {
            this.cmd.push(cb);
            this.src = 'assets/img/' + src;
        }
    };

    return img;
};

},{}],31:[function(require,module,exports){
var nameMap = {
        alt: false,
        ctrl: false,
        shift: false
    },
    codeMap = {};

function getCode(event) {
    return event.charCode || event.keyCode || event.which;
}

document.onkeydown = function (event) {
    var code = getCode(event),
        name = String.fromCharCode(code);
    codeMap[code] = true;
    nameMap[name] = true;
    nameMap.alt = event.altKey;
    nameMap.ctrl = event.ctrlKey;
    nameMap.shift = event.shiftKey;
};
document.onkeyup = function (event) {
    var code = getCode(event),
        name = String.fromCharCode(code);
    codeMap[code] = false;
    nameMap[name] = false;
    nameMap.alt = event.altKey;
    nameMap.ctrl = event.ctrlKey;
    nameMap.shift = event.shiftKey;
};

/**
 * **Example**
 * KeyDown.alt
 * KeyDown.name(' ')
 * KeyDown.code(32)
 */
module.exports = {
    get alt () {
        return nameMap.alt;
    },
    get ctrl () {
        return nameMap.ctrl;
    },
    get shift () {
        return nameMap.shift;
    },
    arrow: {
        get left () {
            return codeMap[37] || false;
        },
        get up () {
            return codeMap[38] || false;
        },
        get right () {
            return codeMap[39] || false;
        },
        get down () {
            return codeMap[40] || false;
        }
    },
    name: function (name) {
        return nameMap[name] || false;
    },
    code: function (code) {
        return codeMap[code] || false;
    }
};

},{}],32:[function(require,module,exports){
var Lumberjack = require('lumberjackjs');

module.exports = Lumberjack();

},{"lumberjackjs":12}],33:[function(require,module,exports){
(function (global){
var Point = require('./point.js'),
    Vector = require('./vector.js'),
    canvas = require('./canvas.js'),
    isDown = false,
    isDragging = false,
    isHolding = false,
    current = Point(),
    last = Point(),
    shift = Vector(),
    startEventName,
    moveEventName,
    endEventName;

if (canvas.mobile) {
    startEventName = 'touchstart';
    moveEventName = 'touchmove';
    endEventName = 'touchend';
} else {
    startEventName = 'mousedown';
    moveEventName = 'mousemove';
    endEventName = 'mouseup';
}

function getOffset(event) {
    if (canvas.mobile) {
        return Point(
            event.touches[0].clientX,
            event.touches[0].clientY
        );
    }
    return Point(
        event.offsetX,
        event.offsetY
    );
}

canvas.addEventListener(
    startEventName,
    function (event) {
        isDown = true;
        current = getOffset(event);
        global.setTimeout(function () {
            if (isDown) {
                isHolding = true;
            }
        }, 200);
    }
);
document.addEventListener(
    endEventName,
    function (event) {
        isDown = isDragging = isHolding = false;
    }
);
canvas.addEventListener(
    moveEventName,
    function (event) {
        last = current;
        current = getOffset(event);

        if (isDown) {
            shift.x = current.x - last.x;
            shift.y = current.y - last.y;
            // Drag threshold.
            if (shift.magnitude > 1) {
                isDragging = true;
            }
        }
    }
);

module.exports = {
    is: {
        get down () {
            return isDown;
        },
        get dragging () {
            return isDragging;
        },
        get holding () {
            return isHolding;
        }
    },
    get offset () {
        return current;
    },
    on: {
        down: function (cb) {
            canvas.addEventListener(startEventName, cb);
        },
        click: function (cb) {},
        dclick: function (cb) {},
        up: function (cb) {
            document.addEventListener(endEventName, cb);
        },
        move: function (cb) {
            canvas.addEventListener(moveEventName, cb);
        }
    },
    eventName: {
        start: startEventName,
        move: moveEventName,
        end: endEventName
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./canvas.js":15,"./point.js":34,"./vector.js":41}],34:[function(require,module,exports){
function Point(x, y) {
    return {
        x: x || 0,
        y: y || 0,
        clone: function () {
            return Point(this.x, this.y);
        },
        equals: function (other) {
            return (
                this.x === other.x &&
                this.y === other.y
            );
        }
    };
}

module.exports = Point;

},{}],35:[function(require,module,exports){
var Vector = require('./vector.js');

function isEqual(my, other, tfactor, mfactor) {
    var mag = my.magnitude === mfactor * other.magnitude,
        mytheta = (my.theta % Math.PI).toFixed(5),
        otheta = ((other.theta + tfactor) % Math.PI).toFixed(5);
    return mag && (mytheta === otheta);
}

/**
 * @param {Number} [theta] Defaults to 0.
 * @param {Number} [mag] Defaults to 0.
 */
function Polar(theta, mag) {
    return {
        theta: theta || 0,
        magnitude: mag || 0,
        invert: function () {
            return Polar(
                this.theta + Math.PI,
                this.magnitude * -1
            );
        },
        clone: function () {
            return Polar(
                this.theta,
                this.magnitude
            );
        },
        toVector: function () {
            return Vector(
                this.magnitude * Math.cos(this.theta),
                this.magnitude * Math.sin(this.theta)
            );
        },
        equals: function (other) {
            return (
                isEqual(this, other, 0, 1) ||
                isEqual(this, other, Math.PI, -1)
            );
        }
    };
}

module.exports = Polar;

},{"./vector.js":41}],36:[function(require,module,exports){
var Shape = require('./shape.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Vector = require('./vector.js');

/**
 * @param {Point} [pos] Defaults to (0,0).
 * @param {Dimension} [size] Defaults to (0,0).
 */
module.exports = function (pos, size) {
    pos = pos || Point();
    size = size || Dimension();

    return Shape({
        pos: pos,
        name: 'rectangle',
        intersects: {
            rectangle: function (rect) {
                return (
                    this.x < rect.right &&
                    this.right > rect.x &&
                    this.y < rect.bottom &&
                    this.bottom > rect.y
                );
            },
            circle: function (circ) {
                var vect,
                    pt = Point(circ.x, circ.y);

                if (circ.x > this.right) pt.x = this.right;
                else if (circ.x < this.x) pt.x = this.x;
                if (circ.y > this.bottom) pt.y = this.bottom;
                else if (circ.y < this.y) pt.y = this.y;

                vect = Vector(
                    circ.x - pt.x,
                    circ.y - pt.y
                );
                return vect.magnitude < circ.radius;
            }
        }
    }).extend({
        width: size.width || 0,
        height: size.height || 0,
        top: pos.y || 0,
        right: pos.x + size.width || 0,
        bottom: pos.y + size.height || 0,
        left: pos.x || 0,
        move: function (x, y) {
            this.x = x;
            this.y = y;
            this.top = y;
            this.right = x + this.width;
            this.bottom = y + this.height;
            this.left = x;
        },
        resize: function (size) {
            this.width = size.width;
            this.height = size.height;
            this.right = this.x + size.width;
            this.bottom = this.y + size.height;
        },
        draw: function (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(250, 50, 50, 0.5)';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    });
};

},{"./dimension.js":23,"./point.js":34,"./shape.js":38,"./vector.js":41}],37:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    EventHandler = require('./event-handler.js'),
    Counter = require('./id-counter.js');

/**
 * @param {Array|Sprite} [opts.spriteSet]
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {String} opts.name
 * @param {Number} [opts.depth] Defaults to 0.
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var loaded = false,
        sprites = [],
        spriteMap = {},
        spritesToAdd = [],
        spritesLoading = [],
        loadQueue = {},
        spriteRemoved = false,
        collisionMap = {},
        updating = false,
        drawing = false;

    // Load queued sprites into the screen.
    function ingestSprites() {
        if (spritesToAdd.length) {
            // Update the master sprite list after updates.
            spritesToAdd.forEach(function (sprite) {
                sprites.push(sprite);
                if (sprite.name) {
                    spriteMap[sprite.name] = sprite;
                }
                sprite.trigger('ready');
            });
            // Sort by descending sprite depths: 3, 2, 1, 0
            sprites.sort(function (a, b) {
                return b.depth - a.depth;
            });
            spritesToAdd = [];
        }
    }

    return BaseClass({
        name: opts.name,
        load: function (cb) {
            if (!loaded) {
                this.addCollisionSets(opts.collisionSets);
                this.addSprites({
                    set: opts.spriteSet,
                    onload: cb,
                    force: true
                });
                loaded = true;
            }
        },
        start: function () {
            updating = true;
            drawing = true;
            this.trigger('start');
        },
        pause: function () {
            updating = false;
            drawing = true;
            this.trigger('pause');
        },
        stop: function () {
            updating = false;
            drawing = false;
            this.trigger('stop');
        },
        depth: opts.depth || 0,
        collision: function (name) {
            return collisionMap[name];
        },
        /**
         * @param {Array|CollisionHandler} set
         */
        addCollisionSets: function (set) {
            if (set) {
                set = [].concat(set);
                set.forEach(function (handler) {
                    collisionMap[handler.name] = handler;
                });
            }
        },
        sprite: function (name) {
            return spriteMap[name];
        },
        /**
         * Loads sprites into this screen together
         * as a batch. None of the batch will be
         * loaded into the screen until all sprites
         * are ready.
         * @param {Array|Sprite} opts.set
         * @param {Function} [onload]
         * @param {Boolean} [force] Defaults to false. True
         * to ingest sprites immediately outside of the normal
         * game pulse.
         */
        addSprites: function (opts) {
            var id, onload, set;
            opts = opts || {};
            onload = opts.onload || function () {};
            set = [].concat(opts.set);

            if (opts.set.length) {
                id = Counter.nextId;
                loadQueue[id] = set.length;
                set.forEach(function (sprite) {
                    sprite.load(function () {
                        loadQueue[id] -= 1;
                        if (loadQueue[id] === 0) {
                            spritesToAdd = spritesToAdd.concat(set);
                            if (opts.force) {
                                ingestSprites();
                            }
                            onload();
                        }
                    });
                });
            } else {
                onload();
            }
        },
        removeSprite: function (sprite) {
            sprite.removed = true;
            spriteRemoved = true;
        },
        update: function () {
            var i;

            if (updating) {
                // Update sprites.
                sprites.forEach(function (sprite) {
                    if (updating && !sprite.removed) {
                        // Don't update dead sprites.
                        sprite.update();
                    }
                });

                // Process collisions.
                for (i in collisionMap) {
                    collisionMap[i].handleCollisions();
                }
            }

            // Load in any queued sprites.
            ingestSprites();
        },
        draw: function (ctx, debug) {
            var name;
            if (drawing) {
                sprites.forEach(function (sprite) {
                    sprite.draw(ctx);
                });
                if (debug) {
                    for (name in collisionMap) {
                        collisionMap[name].draw(ctx);
                    }
                }
            }
        },
        teardown: function () {
            var i;

            if (updating) {
                sprites.forEach(function (sprite) {
                    if (!sprite.removed) {
                        // Don't teardown dead sprites.
                        sprite.teardown();
                    }
                });
            }

            for (i in collisionMap) {
                collisionMap[i].teardown();
            }

            if (spriteRemoved) {
                // Remove any stale sprites.
                sprites = sprites.filter(function (sprite) {
                    // true to keep, false to drop.
                    return !sprite.removed;
                });
                spriteRemoved = false;
            }
        }
    }).implement(
        EventHandler({
            events: opts.on,
            singles: opts.one
        })
    );
};

},{"./event-handler.js":25,"./id-counter.js":29,"baseclassjs":7}],38:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    Point = require('./point.js');

/**
 * @param {Point} [opts.pos] Defaults to (0,0).
 * @param {Object} [opts.intersects] Dictionary of collision tests.
 */
module.exports = function (opts) {
    var pos, intersectMap;

    opts = opts || {};
    intersectMap = opts.intersects || {};
    pos = opts.pos || Point();

    return BaseClass({
        x: pos.x,
        y: pos.y,
        name: opts.name,
        move: BaseClass.Abstract,
        resize: BaseClass.Abstract,
        intersects: function (other) {
            return intersectMap[other.name].call(this, other);
        },
        draw: BaseClass.Stub
    });
};

},{"./point.js":34,"baseclassjs":7}],39:[function(require,module,exports){
var BaseClass = require('baseclassjs'),
    Collidable = require('./collidable.js'),
    Point = require('./point.js'),
    Dimension = require('./dimension.js'),
    Rectangle = require('./rectangle.js');

/**
 * ##### Sprite
 * @param {Array|AnimationStrip} opts.strips
 * @param {String} opts.startingStrip
 * @param {Point} [opts.pos] Defaults to (0,0).
 * @param {Number} [opts.scale] Defaults to 1.
 * @param {Dimension} [opts.size] Defaults to strip size.
 * @param {Number} [opts.depth] Defaults to 0.
 * @param {Number} [opts.rotation] Defaults to 0.
 * @param {Point} [opts.speed] Defaults to (0,0).
 * @param {Boolean} [opts.freemask] Defaults to false. True
 * to decouple the position of the mask from the position
 * of the sprite.
 *
 * ##### Collidable
 * @param {Shape} [opts.mask] Defaults to Rectangle.
 * @param {String} opts.name
 * @param {Array|CollisionHandler} [opts.collisionSets]
 * @param {Object} [opts.on] Dictionary of events.
 * @param {Object} [opts.one] Dictionary of one-time events.
 */
module.exports = function (opts) {
    var loaded = false,
        stripMap = opts.strips || {},
        pos = opts.pos || Point(),
        updating = false,
        drawing = false;

    if (!opts.freemask) {
        opts.mask = opts.mask || Rectangle();
        opts.offset = Point(
            opts.mask.x,
            opts.mask.y
        );
        opts.mask.move(
            pos.x + opts.offset.x,
            pos.x + opts.offset.y
        );
    }
    opts.one = opts.one || {};
    opts.one.ready = opts.one.ready || function () {
        this.start();
    };

    return Collidable(opts).extend({
        strip: stripMap[opts.startingStrip],
        useStrip: function (name) {
            // Do nothing if already using this strip.
            if (this.strip !== stripMap[name]) {
                this.strip.stop();
                this.strip = stripMap[name];
                this.strip.start();
            }
        },
        getStrip: function (name) {
            return stripMap[name];
        },
        pos: pos,
        scale: opts.scale || 1,
        size: opts.size || (stripMap[opts.startingStrip] || {}).size,
        trueSize: function () {
            return this.size.scale(this.scale);
        },
        rotation: opts.rotation || 0,
        depth: opts.depth || 0,
        speed: opts.speed || Point(),
        start: function () {
            updating = true;
            drawing = true;
            this.strip.start();
            this.trigger('start');
        },
        pause: function () {
            updating = false;
            drawing = true;
            this.strip.pause();
            this.trigger('pause');
        },
        stop: function () {
            updating = false;
            drawing = false;
            this.strip.stop();
            this.trigger('stop');
        },
        update: function () {
            if (updating) {
                this.shift();
                this.strip.update();
                this.base.update();
            }
        },
        draw: function (ctx) {
            var stripSize;

            if (drawing) {
                stripSize = this.strip.size;
                this.strip.draw(
                    ctx,
                    this.pos,
                    Dimension(
                        this.scale * this.size.width / stripSize.width,
                        this.scale * this.size.height / stripSize.height
                    ),
                    this.rotation
                );
            }
        },
        load: function (cb) {
            var name, loadQueue;
            if (!loaded) {
                loadQueue = Object.keys(stripMap).length;
                for (name in stripMap) {
                    stripMap[name].load(function () {
                        loadQueue -= 1;
                        if (loadQueue === 0) {
                            cb();
                            loaded = true;
                        }
                    });
                }
            }
        },
        move: function (x, y) {
            this.pos.x = x;
            this.pos.y = y;
            if (!opts.freemask) {
                this.base.move(this.pos);
            }
        },
        shift: function (vx, vy) {
            this.pos.x += vx || this.speed.x;
            this.pos.y += vy || this.speed.y;
            if (!opts.freemask) {
                this.base.move(this.pos);
            }
        }
    });
};

},{"./collidable.js":18,"./dimension.js":23,"./point.js":34,"./rectangle.js":36,"baseclassjs":7}],40:[function(require,module,exports){
var createImage = require('./image.js'),
    cache = {};

/**
 * Duplicate calls to constructor will only
 * load a single time - returning cached
 * data on subsequent calls.
 * @param {String} opts.src
 * @return {Image} HTML5 Image instance.
 */
module.exports = function (opts) {
    var img,
        src = opts.src;

    if (src in cache) {
        img = cache[src];
    } else {
        img = createImage(src);
        cache[src] = img;
    }

    return img;
};

},{"./image.js":30}],41:[function(require,module,exports){
var Polar = require('./polar.js');

/**
 * @param {Number} [x] Defaults to 0.
 * @param {Number} [y] Defaults to 0.
 */
function Vector(x, y) {
    return {
        x: x || 0,
        y: y || 0,
        get magnitude () {
            return Math.abs(
                Math.sqrt(
                    (this.y * this.y) +
                    (this.x * this.x)
                )
            );
        },
        clone: function () {
            return Vector(
                this.x,
                this.y
            );
        },
        equals: function (other) {
            return (
                this.x === other.x &&
                this.y === other.y
            );
        },
        scale: function (scale) {
            return Vector(
                this.x * scale,
                this.y * scale
            );
        },
        toPolar: function () {
            return Polar(
                Math.atan(this.y / this.x),
                this.magnitude
            );
        }
    };
}

module.exports = Vector;

},{"./polar.js":35}],42:[function(require,module,exports){
var $ = require('dragonjs');

module.exports = $.CollisionHandler({
    name: 'racetrack',
    gridSize: $.Dimension(5, 5)
});

},{"dragonjs":20}],43:[function(require,module,exports){
var $ = require('dragonjs'),
    riverton = require('./screens/tracks/riverton.js');

$.Font.load({
    name: 'Wonder',
    src: '8-bit-wonder.ttf'
});
$.Game.addScreens([
    require('./screens/training.js'),
    require('./screens/shop.js'),
    riverton
]);
$.Game.currentTrack = riverton;
$.Game.loadTrack = function (track) {
    this.currentTrack.stop();
    this.currentTrack = track;
    this.currentTrack.start();
};
$.Game.run(true);

},{"./screens/shop.js":49,"./screens/tracks/riverton.js":51,"./screens/training.js":52,"dragonjs":20}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
module.exports = {
    none: function () {},
    flu: function (set) {
        set.speed *= 0.8;
        set.jump *= 0.8;
        set.strength *= 0.8;
    },
    thrush: function (set) {
        set.speed *= 0.2;
    },
    tetanus: function () {},
    rainRot: function () {},
    swampFever: function () {}
};

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
module.exports = {
    next: {
        get horse () {
            return 'clydesdale';
        },
        get jockey () {
            return 'jimmy';
        }
    }
};

},{}],48:[function(require,module,exports){
var Horse = require('./sprites/horse.js'),
    Jockey = require('./sprites/jockey.js');

module.exports = {
    money: 100,
    horse: Horse(),
    jockey: Jockey()
};

},{"./sprites/horse.js":64,"./sprites/jockey.js":65}],49:[function(require,module,exports){
var $ = require('dragonjs');

module.exports = $.Screen({
    name: 'shop',
    spriteSet: [
        require('../sprites/close-shop.js')
    ],
    depth: -1
});

},{"../sprites/close-shop.js":63,"dragonjs":20}],50:[function(require,module,exports){
var $ = require('dragonjs'),
    player = require('../player.js'),
    Util = require('../util.js');

/**
 * @param {Array} horses
 */
module.exports = function (opts) {
    var i,
        horses = opts.horses.concat(player.horse),
        lanes = Util.range(horses.length);

    Util.shuffle(lanes);
    for (i = 0; i < horses.length; i += 1) {
        horses[i].pos.y = lanes[i] * 45 + 40;
    }

    return $.Screen({
        name: 'racetrack',
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: [
            //require('../sprites/buttons/race.js')
        ].concat(horses)
    }).extend({
        horses: horses,
        race: function () {
            horses.forEach(function (horse) {
                horse.race();
            });
        }
    });
};

},{"../collisions/racetrack.js":42,"../player.js":48,"../util.js":67,"dragonjs":20}],51:[function(require,module,exports){
var Track = require('../track.js'),
    Horse = require('../../sprites/horse.js'),
    player = require('../../player.js');

module.exports = Track({
    horses: [
        Horse()
    ]
});

},{"../../player.js":48,"../../sprites/horse.js":64,"../track.js":50}],52:[function(require,module,exports){
var $ = require('dragonjs'),
    player = require('../player.js'),
    race = require('../sprites/buttons/race.js'),
    buttons = {
        horse: [
            require('../sprites/buttons/train-speed.js'),
            require('../sprites/buttons/train-strength.js'),
            require('../sprites/buttons/train-jump.js'),
            require('../sprites/buttons/train-smarts.js')
        ],
        jockey: [
            require('../sprites/buttons/train-jsmarts.js'),
            require('../sprites/buttons/train-size.js'),
            require('../sprites/buttons/train-temper.js')
        ]
    },
    allbuttons = [].
        concat(buttons.horse).
        concat(buttons.jockey);

module.exports = $.Screen({
    name: 'training',
    spriteSet: [
        //require('../sprites/bkg-training.js'),
        require('../sprites/buttons/open-shop.js'),
        require('../sprites/stats.js'),
        race
    ],//.concat(allbuttons),
    one: {
        ready: function () {
            this.start();
        }
    },
    depth: 0
}).extend({
    draw: function (ctx) {
        var grd = ctx.createRadialGradient(
            $.canvas.width * (1 - race.width) / 2,
            $.canvas.height * 0.05,
            $.canvas.width * 0.1,
            $.canvas.width * (1 - race.width) / 2,
            $.canvas.height * 0.05,
            $.canvas.width
        );
        grd.addColorStop(0, '#dfd3c8');
        grd.addColorStop(1, '#bf7140');
        ctx.fillStyle = grd;
        ctx.fillRect(
            0,
            0,
            $.canvas.width * (1 - race.width),
            $.canvas.height
        );
        this.base.draw(ctx);
    }
});

},{"../player.js":48,"../sprites/buttons/open-shop.js":53,"../sprites/buttons/race.js":54,"../sprites/buttons/train-jsmarts.js":55,"../sprites/buttons/train-jump.js":56,"../sprites/buttons/train-size.js":57,"../sprites/buttons/train-smarts.js":58,"../sprites/buttons/train-speed.js":59,"../sprites/buttons/train-strength.js":60,"../sprites/buttons/train-temper.js":61,"../sprites/stats.js":66,"dragonjs":20}],53:[function(require,module,exports){
var $ = require('dragonjs'),
    race = require('./race.js'),
    menu = require('../close-shop.js'),
    margin = {
        top: 0.25
    },
    size = $.Dimension(
        $.canvas.width * 0.3,
        $.canvas.height * (menu.margin.top - margin.top)
    );

module.exports = $.Sprite({
    name: 'shop-button',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        size
    ),
    strips: {
        'up': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'buttons/shop.png'
            }),
            size: $.Dimension(128, 64)
        })
    },
    startingStrip: 'up',
    pos: $.Point(
        ($.canvas.width - race.size.width) / 2 - size.width / 2,
        $.canvas.height * margin.top
    ),
    size: size,
    on: {
        'colliding/screentap': function () {
            $.Game.screen('training').pause();
            $.Game.screen('shop').start();
        }
    }
});

},{"../close-shop.js":63,"./race.js":54,"dragonjs":20}],54:[function(require,module,exports){
var $ = require('dragonjs'),
    width = 0.18;

module.exports = $.Sprite({
    name: 'race',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        $.Dimension($.canvas.width * width, $.canvas.height)
    ),
    strips: {
        'race': $.AnimationStrip({
            sheet: $.SpriteSheet({
                src: 'start-race.png'
            }),
            size: $.Dimension(88, 31)
        })
    },
    startingStrip: 'race',
    pos: $.Point($.canvas.width * (1 - width), 0),
    size: $.Dimension($.canvas.width * width, $.canvas.height),
    on: {
        'colliding/screentap': function () {
            console.log(".. and they're off!");
        }
    }
}).extend({
    width: width
});

},{"dragonjs":20}],55:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+JBRN',
    src: 'buttons/smarts.png',
    pos: $.Point(
        $.canvas.width / 2,
        $.canvas.height / 2 - $.canvas.height / 3
    )
}).extend({
    click: function () {
        player.jockey.coreStats.smarts += 1;
        player.jockey.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],56:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+JMP',
    src: 'buttons/jump.png',
    pos: $.Point(
        9 * $.canvas.width / 100,
        $.canvas.height / 2 - $.canvas.height / 6
    )
}).extend({
    click: function () {
        player.horse.coreStats.jump += 1;
        player.horse.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],57:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+SZE',
    src: 'buttons/size.png',
    pos: $.Point(
        $.canvas.width / 2,
        $.canvas.height / 2 + $.canvas.height / 3
    )
}).extend({
    click: function () {
        player.jockey.coreStats.size += 1;
        player.jockey.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],58:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+BRN',
    src: 'buttons/smarts.png',
    pos: $.Point(
        9 * $.canvas.width / 100,
        $.canvas.height / 2 + $.canvas.height / 6
    )
}).extend({
    click: function () {
        player.horse.coreStats.smarts += 1;
        player.horse.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],59:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+SPD',
    src: 'buttons/speed.png',
    pos: $.Point(
        27 * $.canvas.width / 100,
        $.canvas.height / 2 - $.canvas.height / 3
    )
}).extend({
    click: function () {
        player.horse.coreStats.speed += 1;
        player.horse.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],60:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+STR',
    src: 'buttons/strength.png',
    pos: $.Point(
        27 * $.canvas.width / 100,
        $.canvas.height / 2 + $.canvas.height / 3
    )
}).extend({
    click: function () {
        player.horse.coreStats.strength += 1;
        player.horse.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],61:[function(require,module,exports){
var $ = require('dragonjs'),
    Trainer = require('./train.js'),
    player = require('../../player.js');

module.exports = Trainer({
    title: '+TPR',
    src: 'buttons/temper.png',
    pos: $.Point(
        31 * $.canvas.width / 50,
        $.canvas.height / 2
    )
}).extend({
    click: function () {
        player.jockey.coreStats.temper += 1;
        player.jockey.refreshStats();
    }
});

},{"../../player.js":48,"./train.js":62,"dragonjs":20}],62:[function(require,module,exports){
var $ = require('dragonjs'),
    BaseClass = require('baseclassjs');

/**
 * @param {String} opts.title
 * @param {String} [opts.name] Defaults to title.
 * @param {Point} opts.pos
 * @param {Dimension} opts.size
 * @param {String} opts.src
 */
module.exports = function (opts) {
    return $.Sprite({
        name: opts.name || opts.title,
        collisionSets: [
            $.collisions
        ],
        mask: $.Circle(
            opts.pos,
            40
        ),
        freemask: true,
        strips: {
            'up': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: opts.src
                }),
                size: $.Dimension(256, 64)
            })
        },
        startingStrip: 'up',
        size: $.Dimension(128, 32),
        pos: $.Point(
            opts.pos.x - 64,
            opts.pos.y - 16
        ),
        on: {
            'colliding/screentap': function () {
                this.click();
            }
        }
    }).extend({
        title: opts.title,
        click: BaseClass.Abstract
    });
};

},{"baseclassjs":2,"dragonjs":20}],63:[function(require,module,exports){
var $ = require('dragonjs'),
    race = require('./buttons/race.js'),
    margin = {
        side: 0.1,
        bottom: 0.05,
        top: 0.38
    },
    mask = $.Rectangle(
        $.Point(
            $.canvas.width * margin.side,
            $.canvas.height * margin.top
        ),
        $.Dimension(
            $.canvas.width * (
                1 - (race.width + 2 * margin.side)
            ),
            $.canvas.height * (
                1 - (margin.top + margin.bottom)
            )
        )
    );

module.exports = $.ClearSprite({
    name: 'close-shop',
    collisionSets: [
        $.collisions
    ],
    mask: $.Rectangle(
        $.Point(),
        $.canvas
    ),
    pos: mask,
    size: mask,
    freemask: true,
    on: {
        'colliding/screentap': function (tap) {
            // Close when tapped outside of the menu.
            if (!tap.intersects(mask)) {
                $.Game.screen('shop').stop();
                $.Game.screen('training').start();
            }
        }
    }
}).extend({
    margin: margin,
    update: function () {
        $.collisions.update(this);
    },
    draw: function (ctx) {
        ctx.fillStyle = 'rgba(68, 68, 68, 0.6)';
        ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height
        );
        mask.draw(ctx);
    }
});

},{"./buttons/race.js":54,"dragonjs":20}],64:[function(require,module,exports){
var $ = require('dragonjs'),
    Namer = require('../namer.js'),
    Illness = require('../illness.js'),
    Stats = require('../horse-stats.js');

module.exports = function (opts) {
    opts = opts || {};

    return $.Sprite({
        name: 'horse',
        collisionSets: [
            require('../collisions/racetrack.js'),
            $.collisions
        ],
        mask: $.Rectangle(
            $.Point(),
            $.Dimension(50, 37)
        ),
        strips: {
            'horse': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: 'horse.png'
                }),
                size: $.Dimension(50, 37),
            })
        },
        startingStrip: 'horse',
        on: {
            'collide/screenedge/right': function () {
                this.speed.x = 0;
            }
        }
    }).extend({
        showname: opts.showname || Namer.next.horse,
        coreStats: opts.stats || Stats(),
        adjStats: Stats(),
        refreshStats: function (mod) {
            var set = this.coreStats.clone();
            mod = mod || function () {};
            mod(set);
            this.sickness(set);
            this.adjStats = set;
        },
        sickness: Illness.none,
        race: function () {
            this.refreshStats();
            this.speed.x = this.adjStats.speed;
        }
    });
};

},{"../collisions/racetrack.js":42,"../horse-stats.js":44,"../illness.js":45,"../namer.js":47,"dragonjs":20}],65:[function(require,module,exports){
var $ = require('dragonjs'),
    Namer = require('../namer.js'),
    Stats = require('../jockey-stats.js');

module.exports = function (opts) {
    opts = opts || {};

    return $.Sprite({
        name: 'jockey',
        strips: {
            'jockey': $.AnimationStrip({
                sheet: $.SpriteSheet({
                    src: 'jockey.png'
                }),
                size: $.Dimension(64, 64),
            })
        },
        startingStrip: 'jockey',
        pos: $.Point(100, 100),
        depth: 2
    }).extend({
        showname: opts.showname || Namer.next.jockey,
        coreStats: opts.stats || Stats(),
        adjStats: Stats(),
        refreshStats: function (mod) {
            var set = this.coreStats.clone();
            mod = mod || function () {};
            mod(set);
            this.adjStats = set;
        }
    });
};

},{"../jockey-stats.js":46,"../namer.js":47,"dragonjs":20}],66:[function(require,module,exports){
var $ = require('dragonjs'),
    BaseClass = require('baseclassjs'),
    player = require('../player.js'),
    marks = {
        horse: {
            speed: $.Point(
                $.canvas.width * 0.29,
                $.canvas.height / 2 - $.canvas.height * 0.15
            ),
            jump: $.Point(
                $.canvas.width * 0.18,
                $.canvas.height / 2 - $.canvas.height * 0.06
            ),
            smarts: $.Point(
                $.canvas.width * 0.18,
                $.canvas.height / 2 + $.canvas.height * 0.06
            ),
            strength: $.Point(
                $.canvas.width * 0.29,
                $.canvas.height / 2 + $.canvas.height * 0.15
            )
        },
        jockey: {
            smarts: $.Point(
                $.canvas.width * 0.435,
                $.canvas.height / 2 - $.canvas.height * 0.14
            ),
            temper: $.Point(
                $.canvas.width * 0.505,
                $.canvas.height / 2
            ),
            size: $.Point(
                $.canvas.width * 0.435,
                $.canvas.height / 2 + $.canvas.height * 0.14
            )
        }
    };

module.exports = $.ClearSprite({
    name: 'stats',
    depth: 2
}).extend({
    draw: function (ctx) {
        var name, mark;
        ctx.font = '16px Wonder';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        for (name in marks.horse) {
            mark = marks.horse[name];
            ctx.fillText(
                player.horse.coreStats[name],
                mark.x,
                mark.y
            );
        }
        for (name in marks.jockey) {
            mark = marks.jockey[name];
            ctx.fillText(
                player.jockey.coreStats[name],
                mark.x,
                mark.y
            );
        }
    }
});

},{"../player.js":48,"baseclassjs":2,"dragonjs":20}],67:[function(require,module,exports){
module.exports = {
    shuffle: function (arr) {
        var i, j, x;
        for (i = 0; i < arr.length; i += 1) {
            j = parseInt(
                Math.random() * (i + 1)
            );
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    },
    range: function (start, end) {
        var i, len,
            arr = [];

        if (!end) {
            end = start;
            start = 0;
        }

        len = end - start;
        for (i = 0; i < len; i += 1) {
            arr.push(i + start);
        }
        return arr;
    }
};

},{}]},{},[43,44,45,46,47,48,67]);
