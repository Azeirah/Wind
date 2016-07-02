(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.wind = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.PointerManager = require("./source/PointerManager");
global.Cursor = require("./source/pointers/Cursor");
global.Swinger = require("./source/pointers/Swinger");
global.Stalker = require("./source/pointers/Stalker");
global.Slider = require("./source/pointers/Slider");
global.mirror = require("./source/spawners/mirror");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./source/PointerManager":3,"./source/pointers/Cursor":5,"./source/pointers/Slider":7,"./source/pointers/Stalker":8,"./source/pointers/Swinger":9,"./source/spawners/mirror":10}],2:[function(require,module,exports){
var geometry = require("./geometry");

/**
 * Base class for any pointer-like object
 * @param {number} x Initial x position
 * @param {number} y Initial y position
 * @property {boolean} free A pointer is free whenever it should not respond to user-input anymore
 * @property {boolean} dead A pointer is dead whenever it's ok to clean it up
 * @property {number} x The x position of the pointer
 * @property {number} y The y position of the pointer
 * @property {[x, y].x/.y} origin The original starting position of this pointer passed to the constructor
 * @property {number} direction Direction the pointer is moving in in radians, is undefined if the pointer has not moved yet
 * @property {number} speed How fast the pointer is moving, is undefined if the pointer has not moved yet. The speed is defined by taking the distance between the current location and the previous location of the pointer
 * @property {number} lifetime This numbers keeps track of how many times the position of the pointer has been updated via the notifyPositionChangedListeners call.
 * @property {number} rotation Angle in radians how much this pointer should be rotated around its origin, can be set with `pointer.setRotation` and read with `pointer.rotation`
 * @property {[x, y].x/.y} previousPosition The previous position of the pointer, undefined if the pointer hasn't moved yet
 */
function Pointer(x, y) {
    var pointer = this;

    if (x === undefined || y === undefined) {
        throw new ReferenceError("Pointer did not receive initial x, y coordinates");
    }

    this.positionChangedListeners = {};

    // the pointer is considered "free" when it shouldn't
    // respond to user input anymore
    pointer.free = false;

    // the pointer is considered "dead" when it won't ever move anymore
    // when the pointer dies, it can be cleaned up.
    pointer.dead = false;

    pointer[0] = x;
    pointer[1] = y;

    pointer.origin = [x, y];
    pointer.origin.x = this.x;
    pointer.origin.y = this.y;

    pointer.lifetime = 0;

    // transformations
    pointer.rotation = 0;
    pointer.scaling = 0;
    pointer.offsetX = 0;
    pointer.offsetY = 0;
}

Object.defineProperties(Pointer.prototype, {
    x: {
        get: function () {
            var rotated = geometry.rotatePoint(this, this.origin, this.rotation);
            var scaled = geometry.scalePoint(rotated, this.origin, this.scaling);
            var translated = geometry.translatePoint(scaled, this.offsetX, this.offsetY);
            return translated[0];
        }
    },
    y: {
        get: function () {
            var rotated = geometry.rotatePoint(this, this.origin, this.rotation);
            var scaled = geometry.scalePoint(rotated, this.origin, this.scaling);
            var translated = geometry.translatePoint(scaled, this.offsetX, this.offsetY);
            return translated[1];
        }
    }
});

Pointer.prototype.beforeMove = function before() {
    this.previousPosition = {
        '0': this[0],
        '1': this[1],
        // x and y are stored for the end-user, if pointer.x/y are available, so should pointer.previousPosition.x/y
        x: this.x,
        y: this.y
    };
};

Pointer.prototype.afterMove = function after() {
    if (! this.previousPosition) {
        throw new ReferenceError("You've forgotten a `beforeMove` call before this `afterMove` call");
    }

    this.speed = geometry.calculateDistance(this, this.previousPosition);
    this.direction = geometry.calculateAngle(this, this.previousPosition);

    if (this.speed <= 0.01 && this.free) {
        this.dead = true;
    } else {
        this.notifyPositionChangedListeners();
    }
};

/**
 * Set the rotation of the pointer
 * @param {number} rotation An angle in radians
 */
Pointer.prototype.setRotation = function (rotation) {
    this.rotation = rotation;
};

Pointer.prototype.setScale = function (scale) {
    this.scaling = scale;
};

Pointer.prototype.setOffset = function (offsetX, offsetY) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
};

Pointer.prototype.setDrawingFunction = function (drawFn) {
    this.drawFn = drawFn;
};

Pointer.prototype.onPositionChanged = function (callback) {
    var id = Object.keys(this.positionChangedListeners).length;
    this.positionChangedListeners[id] = callback;

    return function () {
        if (this.positionChangedListeners[id]) {
            this.positionChangedListeners[id] = undefined;
        }
    };
};

Pointer.prototype.notifyPositionChangedListeners = function () {
    var pointer = this;
    var args = arguments;

    pointer.lifetime += 1;

    Object.keys(pointer.positionChangedListeners).map(function (key) {
        return pointer.positionChangedListeners[key];
    }).forEach(function (listener) {
        listener.apply(pointer, args);
    });
};

module.exports = Pointer;

},{"./geometry":4}],3:[function(require,module,exports){
function PointerManager(ctx) {
    var manager = this;
    // this is the code that manages all the physics objects
    // calls their step functions and their render functions
    // make sure to instantiate the manager before creating
    // PhysicsPointer objects
    this.entities = [];
    this.ctx = ctx;

    function cleanup() {
        manager.entities = manager.entities.filter(function (entity) {
            return !entity.dead;
        });
    }

    function step() {
        manager.entities.forEach(function(entity) {
            if (!entity.dead) {
                entity.step();
            }
        });

        cleanup();
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

PointerManager.prototype.addEntity = function (entity) {
    this.entities.push(entity);
};

PointerManager.prototype.setTarget = function (x, y) {
    this.entities.forEach(function(entity) {
        entity.setTarget(x, y);
    });
}

PointerManager.prototype.freeEntities = function () {
    this.entities.forEach(function (entity) {
        entity.free = true;
    });
}

module.exports = PointerManager;

},{}],4:[function(require,module,exports){
/**
 * Calculate a distance using pythagoras' formula
 * @param  {[x, y]} firstPoint  The first point
 * @param  {[x, y]} secondPoint The second point
 * @return {number}             Distance between the two points
 */
function calculateDistance (firstPoint, secondPoint) {
    var dx = firstPoint[0] - secondPoint[0];
    var dy = firstPoint[1] - secondPoint[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

/**
 * Calculate the angle between two points
 * @param  {[x, y]} firstPoint  The first point
 * @param  {[x, y]} secondPoint The second point
 * @return {number}             Angle between the two points
 */
function calculateAngle (firstPoint, secondPoint) {
    var dx = firstPoint[0] - secondPoint[0];
    var dy = firstPoint[1] - secondPoint[1];

    return Math.atan2(dy, dx);
}

/**
 * Rotate a point around an origin with angle `angle`
 * The original point remains unmutated, a new point is returned
 *
 * @param  {[x, y]} point  The point you want to rotate
 * @param  {[x, y]} origin An origin you want to rotate around
 * @param  {number} angle  How much the point should be rotated in radians
 * @return {[x, y]}        The rotated point
 */
function rotatePoint (point, origin, angle) {
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);

    var xRotated = (point[0] - origin[0]) * cos - (point[1] - origin[1]) * sin;
    var yRotated = (point[0] - origin[0]) * sin + (point[1] - origin[1]) * cos;

    var x = xRotated + origin[0];
    var y = yRotated + origin[1];

    return [x, y];
}

/**
 * Scales a point from an origin, a point at (5, 5) with a scale of two and origin of (0, 0) will be at (10, 10)
 * The original point remains unmutated, a new point is returned.
 *
 * @param  {[x, y]} point  The point you want to scale
 * @param  {[x, y]} origin The origin you want to scale from
 * @param  {number} scale  How much you want to scale, 1 means no scaling, 0.5 means half, 2 means double etc...
 * @return {[x, y]}        The new scaled point
 */
function scalePoint (point, origin, scale) {
    var x = point[0] + (point[0] - origin[0]) * scale;
    var y = point[1] + (point[1] - origin[1]) * scale;

    return [x, y];
}

/**
 * Translates a point's location by `offsetX` and `offsetY`
 * The original point remains unmutated, a new point is returned.
 *
 * @param  {[x, y]} point   The point to be translated
 * @param  {number} offsetX The amount of translation wanted on the horizontal axis
 * @param  {number} offsetY The amount of translation wanted on the vertical axis
 * @return {[x, y]}         The resulting translated point
 */
function translatePoint(point, offsetX, offsetY) {
    var x = point[0] + offsetX;
    var y = point[1] + offsetY;

    return [x, y];
}

/**
 * Calculates if a point lies within or outside a circle of given radius
 * @param  {[number, number]} origin, origin of the circle
 * @param  {[number, number]} point, point to check
 * @return {boolean}
 */
function withinCircle(origin, point, radius) {
    return calculateDistance(origin, point) <= radius;
}

module.exports = {
    calculateDistance : calculateDistance,
    calculateAngle    : calculateAngle,
    withinCircle      : withinCircle,
    rotatePoint       : rotatePoint,
    scalePoint        : scalePoint,
    translatePoint    : translatePoint
};

},{}],5:[function(require,module,exports){
var Pointer = require("../Pointer");

Cursor.prototype = new Pointer(0, 0);
/**
 * Cursor is the pointer whose position is always equal to the mouse's position
 * As with all pointers, you have access to .x and .y positions, speed, direction and previousPosition
 */
function Cursor() {
    var cursor = this;
    Pointer.apply(this, arguments);

    function update (event) {
        cursor.beforeMove();
        cursor[0] = event.clientX;
        cursor[1] = event.clientY;
        cursor.afterMove();
        cursor.notifyPositionChangedListeners();
    }

    // keep reference so it can later be cleaned up
    cursor._update = update;

    document.body.addEventListener("az-dragStart", update);
    document.body.addEventListener("az-drag", update);
}

Cursor.prototype.destruct = function () {
    document.body.removeEventListener("az-dragStart", this._update);
    document.body.removeEventListener("az-drag", this._update);
};

module.exports = Cursor;

},{"../Pointer":2}],6:[function(require,module,exports){
var Pointer = require("../Pointer");

PhysicsPointer.prototype = new Pointer(0, 0);
/**
 * PhysicsPointer is a base-class for pointers that rely on differential equations for movement. In other words, if your pointer deals with velocity/friction/jerk/gravity and a step function to move, use the PhysicsPointer
 * @inheritDoc
 * @attribute target {[x, y]} The target this pointer is using to calculate its next position
 */
function PhysicsPointer() {
    Pointer.apply(this, arguments);
    this.target = [this[0], this[1]];
}

PhysicsPointer.prototype.setTarget = function (x, y) {
    if (!this.free) {
        this.target[0] = x;
        this.target[1] = y;
    }
};

PhysicsPointer.prototype.step = function() {
    throw new ReferenceError("An object inheriting from PhysicsPointer is missing its step function");
};

module.exports = PhysicsPointer;

},{"../Pointer":2}],7:[function(require,module,exports){
var PhysicsPointer = require("./PhysicsPointer");

Slider.prototype = new PhysicsPointer(0, 0);
function Slider() {
    PhysicsPointer.apply(this, arguments);
    this.velocity = [0, 0];
    // empirically chosen value
    this.friction = 0.987;
    this.scale = 0.01;
}

Slider.prototype.step = function () {
    this.beforeMove();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        if (!this.free) {
            this.velocity[0] += dx * this.scale;
            this.velocity[1] += dy * this.scale;
        }

        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;

        this[0] += this.velocity[0];
        this[1] += this.velocity[1];

        this.afterMove();
    }
};

module.exports = Slider;

},{"./PhysicsPointer":6}],8:[function(require,module,exports){
var PhysicsPointer = require("./PhysicsPointer");

Stalker.prototype = new PhysicsPointer(0, 0);
function Stalker() {
    PhysicsPointer.apply(this, arguments);
    this.stepSize = 0.05;
    this.speed = 0;
}

Stalker.prototype.step = function() {
    this.beforeMove();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this[0] += dx * this.stepSize;
        this[1] += dy * this.stepSize;

       this.afterMove();
    }
};

module.exports = Stalker;

},{"./PhysicsPointer":6}],9:[function(require,module,exports){
var PhysicsPointer = require("./PhysicsPointer");

Swinger.prototype = new PhysicsPointer(0, 0);
function Swinger() {
    PhysicsPointer.apply(this, arguments);
    this.velocity = [0, 0];
    this.friction = 0.998;
    this.scale = 0.01;
}

Swinger.prototype.step = function() {
    this.beforeMove();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this.velocity[0] += dx * this.scale;
        this.velocity[1] += dy * this.scale;
        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;

        this[0] += this.velocity[0];
        this[1] += this.velocity[1];

        this.afterMove();
    }
};

module.exports = Swinger;

},{"./PhysicsPointer":6}],10:[function(require,module,exports){
 var Pointer = require("../Pointer");
 var geometry = require("../geometry.js");

/**
 * Higher-order function to generate mirrors, it gives the mirror pointer the right speed, origin, initial position, scaling, rotation.
 * All you have to do to create a new mirror is pass a function that computes a new position from the original pointer and an origin to mirror around
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */
function _bootstrapMirror(fn) {
    return function(originalPointer, origin) {
        var pointerAttrs = fn(originalPointer, origin);
        var initialPosition = pointerAttrs.position;
        var copy = new Pointer(initialPosition[0], initialPosition[1]);
        copy.origin = initialPosition;
        copy.rotation = pointerAttrs.rotation;
        copy.offsetX = pointerAttrs.offsetX;
        copy.offsetY = pointerAttrs.offsetY;
        copy.setDrawingFunction(originalPointer.drawFn);

        originalPointer.onPositionChanged(function() {
            var pointerAttrs = fn(originalPointer, origin);
            copy.scaling = originalPointer.scaling;
            copy.rotation = pointerAttrs.rotation;
            copy.offsetX = pointerAttrs.offsetX;
            copy.offsetY = pointerAttrs.offsetY;
            originalPointer.beforeMove.call(copy);

            // position is calculated by the passed function
            var newPosition = pointerAttrs.position;
            copy[0] = newPosition[0];
            copy[1] = newPosition[1];

            originalPointer.afterMove.call(copy);

            copy.drawFn();
        });
    };
}

var _mirrorHorizontal = _bootstrapMirror(function(originalPointer, origin) {
    return {
        position: [
            origin[0] + origin[0] - originalPointer[0],
            originalPointer[1]
        ],
        // when mirroring, the original pointer's rotation needs to be mirrored as well.
        // Otherwise the pointer will rotate into the wrong direction, creating skewed paths
        rotation: -originalPointer.rotation,
        offsetX: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[0],
        offsetY: originalPointer.offsetY

    };
});

var _mirrorVertical = _bootstrapMirror(function(originalPointer, origin) {
    return {
        position: [
            originalPointer[0],
            origin[1] + origin[1] - originalPointer[1]
        ],
        rotation: -originalPointer.rotation,
        offsetX: originalPointer.offsetX,
        offsetY: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[1]
    };
});

var _mirrorDiagonal = _bootstrapMirror(function(originalPointer, origin) {
    return {
        position: [
            origin[0] + origin[0] - originalPointer[0],
            origin[1] + origin[1] - originalPointer[1]
        ],
        // the diagonal mirror's rotation should /not/ be inverted, it's going into the right direction already
        rotation: originalPointer.rotation,
        offsetX: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[0],
        offsetY: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[1],
    };
});

/**
 * Mirror takes a pointer and mirrors it in configurable ways.
 *
 * @param  {Pointer} pointer The pointer you want to mirror
 * @param  {string}  how     "horizontal" | "vertical" | "diagonal" | "4-way"
 * @param  {[x, y]}  origin  where to mirror from, by default you get a kaleidoscope effect
 *                           otherwise, you likely want to input the pointer's origin here
 *                           to get a local mirror effect
 *
 * examples:
 * mirror(pointer, "horizontal") // horizontal kaleidoscope
 * mirror(pointer, "diagonal", [pointer[0], pointer[1]]) // local diagonal mirroring
 *
 * All attributes of the original pointer are continuously copied to the mirrored pointer
 * so attributes like speed and direction can be accessed from the mirror pointer.
 */
function mirror(pointer, how, origin) {
    if (!origin) {
        origin = [ctx.canvas.width / 2, ctx.canvas.height / 2];
    } else {
        origin = [pointer[0], pointer[1]];
    }

    switch (how) {
        case "horizontal":
            _mirrorHorizontal(pointer, origin);
            break;
        case "vertical":
            _mirrorVertical(pointer, origin);
            break;
        case "diagonal":
            _mirrorDiagonal(pointer, origin);
            break;
        case "4-way":
            _mirrorHorizontal(pointer, origin);
            _mirrorVertical(pointer, origin);
            _mirrorDiagonal(pointer, origin);
            break;
    }
}

module.exports = mirror;

},{"../Pointer":2,"../geometry.js":4}]},{},[1])(1)
});