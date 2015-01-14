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
},{}],12:[function(require,module,exports){
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

},{"./dimension.js":21,"./log.js":29,"./point.js":31}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
var mobile = require('./detect-mobile.js'),
    canvas = document.createElement('canvas');

if (mobile) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.style.height = canvas.height + 'px';
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

},{"./detect-mobile.js":20}],15:[function(require,module,exports){
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

},{"./dimension.js":21,"./point.js":31,"./shape.js":35,"./vector.js":38}],16:[function(require,module,exports){
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
            collisionsThisFrame = {};
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

},{"./event-handler.js":23,"./id-counter.js":26,"./point.js":31,"./rectangle.js":33,"baseclassjs":7}],17:[function(require,module,exports){
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

},{"./canvas.js":14,"./dimension.js":21,"./point.js":31,"./rectangle.js":33}],18:[function(require,module,exports){
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

    CollisionHandler: require('./collision-handler.js'),
    collisions: require('./dragon-collisions.js'),

    Game: require('./game.js'),
    Screen: require('./screen.js'),
    Collidable: require('./collidable.js'),
    Sprite: require('./sprite.js')
};

},{"./animation-strip.js":12,"./audio.js":13,"./circle.js":15,"./collidable.js":16,"./collision-handler.js":17,"./dimension.js":21,"./dragon-collisions.js":22,"./event-handler.js":23,"./frame-counter.js":24,"./game.js":25,"./id-counter.js":26,"./keyboard.js":28,"./mouse.js":30,"./point.js":31,"./polar.js":32,"./rectangle.js":33,"./screen.js":34,"./shape.js":35,"./sprite.js":36,"./spritesheet.js":37,"./vector.js":38}],19:[function(require,module,exports){
module.exports = {
    show: {
        fps: function () {}
    }
};

},{}],20:[function(require,module,exports){
/**
 * @see https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
 */
module.exports = 'ontouchstart' in window;

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
var CollisionHandler = require('./collision-handler.js'),
    Dimension = require('./dimension.js');

module.exports = CollisionHandler({
    name: 'dragon',
    gridSize: Dimension(4, 4)
});

},{"./collision-handler.js":17,"./dimension.js":21}],23:[function(require,module,exports){
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

},{"baseclassjs":7}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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
Mouse.on.up(function () {
    masks.screentap.clearCollisions();
});

module.exports = {
    log: log,
    canvas: canvas,
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
            dragonCollisions.draw(ctx, true);
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

},{"./canvas.js":14,"./circle.js":15,"./collidable.js":16,"./collision-handler.js":17,"./debug-console.js":19,"./dimension.js":21,"./dragon-collisions.js":22,"./frame-counter.js":24,"./id-counter.js":26,"./log.js":29,"./mouse.js":30,"./point.js":31,"./rectangle.js":33}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
var Lumberjack = require('lumberjackjs');

module.exports = Lumberjack();

},{"lumberjackjs":11}],30:[function(require,module,exports){
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
},{"./canvas.js":14,"./point.js":31,"./vector.js":38}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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

},{"./vector.js":38}],33:[function(require,module,exports){
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

},{"./dimension.js":21,"./point.js":31,"./shape.js":35,"./vector.js":38}],34:[function(require,module,exports){
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

            if (opts.set) {
                onload = opts.onload || function () {};
                set = [].concat(opts.set);
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

},{"./event-handler.js":23,"./id-counter.js":26,"baseclassjs":7}],35:[function(require,module,exports){
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

},{"./point.js":31,"baseclassjs":7}],36:[function(require,module,exports){
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

    opts.mask = opts.mask || Rectangle();
    opts.offset = Point(
        opts.mask.x,
        opts.mask.y
    );
    opts.mask.move(
        pos.x + opts.offset.x,
        pos.x + opts.offset.y
    );
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
        size: opts.size || stripMap[opts.startingStrip].size,
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

},{"./collidable.js":16,"./dimension.js":21,"./point.js":31,"./rectangle.js":33,"baseclassjs":7}],37:[function(require,module,exports){
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

},{"./image.js":27}],38:[function(require,module,exports){
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

},{"./polar.js":32}],39:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    CollisionHandler = Dragon.CollisionHandler;

module.exports = CollisionHandler({
    name: 'racetrack',
    gridSize: Dimension(5, 5)
});

},{"dragonjs":18}],40:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    riverton = require('./screens/tracks/riverton.js');

Game.addScreens([
    require('./screens/training.js'),
    riverton
]);
Game.currentTrack = riverton;
Game.loadTrack = function (track) {
    this.currentTrack.stop();
    this.currentTrack = track;
    this.currentTrack.start();
};
Game.run(true);

},{"./screens/tracks/riverton.js":45,"./screens/training.js":46,"dragonjs":18}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
module.exports = {
    get next () {
        return 'clydesdale';
    }
};

},{}],43:[function(require,module,exports){
var Horse = require('./sprites/horse.js');

module.exports = {
    money: 100,
    horse: Horse()
};

},{"./sprites/horse.js":54}],44:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
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

    return Screen({
        name: 'racetrack',
        collisionSets: [
            require('../collisions/racetrack.js')
        ],
        spriteSet: [
            require('../sprites/button-race.js')
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

},{"../collisions/racetrack.js":39,"../player.js":43,"../sprites/button-race.js":47,"../util.js":57,"dragonjs":18}],45:[function(require,module,exports){
var Track = require('../track.js'),
    Horse = require('../../sprites/horse.js'),
    player = require('../../player.js');

module.exports = Track({
    horses: [
        Horse()
    ]
});

},{"../../player.js":43,"../../sprites/horse.js":54,"../track.js":44}],46:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Screen = Dragon.Screen,
    player = require('../player.js'),
    buttons = {
        horse: [
            require('../sprites/button-train-speed.js'),
            require('../sprites/button-train-strength.js'),
            require('../sprites/button-train-jump.js'),
            require('../sprites/button-train-smarts.js')
        ]
    },
    allbuttons = [].
        concat(buttons.horse);

module.exports = Screen({
    name: 'training',
    spriteSet: [
        player.horse
    ],
    one: {
        ready: function () {
            this.start();
        }
    }
}).extend({
    update: function () {
        allbuttons.forEach(function (btn) {
            btn.update();
        });
        Dragon.collisions.update(
            Dragon.Collidable({
                name: 'temp',
                mask: Dragon.Circle(
                    Dragon.Point(
                        Dragon.Game.canvas.width * 3 / 8,
                        Dragon.Game.canvas.height / 2
                    ),
                    5
                )
            })
        );
        this.base.update();
    },
    teardown: function () {
        allbuttons.forEach(function (btn) {
            btn.teardown();
        });
        this.base.teardown();
    }
});

},{"../player.js":43,"../sprites/button-train-jump.js":48,"../sprites/button-train-smarts.js":49,"../sprites/button-train-speed.js":50,"../sprites/button-train-strength.js":51,"dragonjs":18}],47:[function(require,module,exports){
var Button = require('./button.js'),
    Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    Point = Dragon.Point,
    Game = Dragon.Game,
    canvas = Game.canvas;

module.exports = Button({
    title: 'RACE',
    size: Dimension(93, 31),
    pos: Point(10, canvas.height - 40)
}).extend({
    click: function () {
        Game.currentTrack.race();
        this.strip.frame = 1;
        this.pause();
    }
});

},{"./button.js":53,"dragonjs":18}],48:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    canvas = Dragon.Game.canvas,
    Trainer = require('./button-train.js');

module.exports = Trainer({
    title: '+JMP',
    pos: Point(
        3 * canvas.width / 16,
        canvas.height / 2 - 1.73 / 16 * canvas.width
    ),
    effect: function (set) {
        set.jump += 2;
        console.log(this.title);
    }
});

},{"./button-train.js":52,"dragonjs":18}],49:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    canvas = Dragon.Game.canvas,
    Trainer = require('./button-train.js');

module.exports = Trainer({
    title: '+BRN',
    pos: Point(
        3 * canvas.width / 16,
        canvas.height / 2 + 1.73 / 16 * canvas.width
    ),
    effect: function (set) {
        set.smarts += 2;
        console.log(this.title);
    }
});

},{"./button-train.js":52,"dragonjs":18}],50:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    canvas = Dragon.Game.canvas,
    Trainer = require('./button-train.js');

module.exports = Trainer({
    title: '+SPD',
    pos: Point(
        3 / 8 * canvas.width - canvas.height / (3 * 1.73),
        canvas.height / 2 - canvas.height / 3
    ),
    effect: function (set) {
        set.speed += 2;
        console.log(this.title);
    }
});

},{"./button-train.js":52,"dragonjs":18}],51:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    canvas = Dragon.Game.canvas,
    Trainer = require('./button-train.js');

module.exports = Trainer({
    title: '+STR',
    pos: Point(
        3 / 8 * canvas.width - canvas.height / (3 * 1.73),
        canvas.height / 2 + canvas.height / 3
    ),
    effect: function (set) {
        set.strength += 2;
        console.log(this.title);
    }
});

},{"./button-train.js":52,"dragonjs":18}],52:[function(require,module,exports){
var RadialButton = require('./radial-button.js'),
    Dragon = require('dragonjs'),
    Dimension = Dragon.Dimension,
    player = require('../player.js');

module.exports = function (opts) {
    return RadialButton({
        title: opts.title,
        pos: opts.pos
    }).extend({
        click: function () {
            opts.effect(
                player.horse.coreStats
            );
            player.horse.refreshStats();
        }
    });
};

},{"../player.js":43,"./radial-button.js":55,"dragonjs":18}],53:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    BaseClass = require('baseclassjs');

/**
 * @param {String} opts.title
 * @param {String} [opts.name] Defaults to title.
 * @param {Dimension} opts.size
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    return Sprite({
        name: opts.name || opts.title,
        collisionSets: [
            Dragon.collisions
        ],
        mask: Rect(
            Point(),
            opts.size
        ),
        strips: {
            'button-race': AnimationStrip({
                sheet: SpriteSheet({
                    src: 'button.png'
                }),
                size: Dimension(88, 31)
            })
        },
        startingStrip: 'button-race',
        pos: opts.pos,
        size: opts.size,
        on: {
            'colliding/screentap': function () {
                this.click();
            }
        }
    }).extend({
        title: opts.title,
        click: BaseClass.Abstract,
        draw: function (ctx) {
            this.base.draw(ctx);
            ctx.font = '30px Verdana';
            ctx.fillStyle = 'white';
            ctx.fillText(
                this.title,
                this.pos.x + 5,
                this.pos.y + 27
            );
        }
    });
};

},{"baseclassjs":2,"dragonjs":18}],54:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Game = Dragon.Game,
    Point = Dragon.Point,
    Dimension = Dragon.Dimension,
    Rect = Dragon.Rectangle,
    Sprite = Dragon.Sprite,
    AnimationStrip = Dragon.AnimationStrip,
    SpriteSheet = Dragon.SpriteSheet,
    Namer = require('../namer.js'),
    Illness = require('../illness.js'),
    Stats = require('../stats.js');

module.exports = function (opts) {
    opts = opts || {};
    return Sprite({
        name: 'horse',
        collisionSets: [
            require('../collisions/racetrack.js'),
            Dragon.collisions
        ],
        mask: Rect(
            Point(),
            Dimension(50, 37)
        ),
        strips: {
            'horse': AnimationStrip({
                sheet: SpriteSheet({
                    src: 'horse.png'
                }),
                size: Dimension(50, 37),
            })
        },
        startingStrip: 'horse',
        on: {
            'collide/screenedge/right': function () {
                this.speed.x = 0;
            }
        }
    }).extend({
        showname: opts.showname || Namer.next,
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

},{"../collisions/racetrack.js":39,"../illness.js":41,"../namer.js":42,"../stats.js":56,"dragonjs":18}],55:[function(require,module,exports){
var Dragon = require('dragonjs'),
    Circle = Dragon.Circle,
    Collidable = Dragon.Collidable,
    BaseClass = require('baseclassjs');

/**
 * @param {String} opts.title
 * @param {String} [opts.name] Defaults to title.
 * @param {Point} opts.pos
 */
module.exports = function (opts) {
    return Collidable({
        name: opts.name || opts.title,
        collisionSets: [
            Dragon.collisions
        ],
        mask: Circle(
            opts.pos,
            30
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

},{"baseclassjs":2,"dragonjs":18}],56:[function(require,module,exports){
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

},{}],57:[function(require,module,exports){
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

},{}]},{},[40,41,42,43,56,57]);
