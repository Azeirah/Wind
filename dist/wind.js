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

    pointer.rotation = 0;
}

Object.defineProperties(Pointer.prototype, {
    x: {
        get: function () {
            return this.origin[0] + (this[0] - this.origin[0]) * Math.cos(this.rotation) + (this[1] - this.origin[1]) * Math.sin(this.rotation);
        }
    },
    y: {
        get: function () {
            return this.origin[1] + (this[0] - this.origin[0]) * Math.sin(this.rotation) + (this[1] - this.origin[1]) * Math.cos(this.rotation);
        }
    }
})

/**
 * Set the rotation of the pointer
 * @param {number} rotation An angle in radians
 */
Pointer.prototype.setRotation = function (rotation) {
    this.rotation = rotation;
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
    Object.keys(pointer.positionChangedListeners).map(function (key) {
        return pointer.positionChangedListeners[key]
    }).forEach(function (listener) {
        listener.apply(pointer, args);
    });
};

module.exports = Pointer;

},{}],3:[function(require,module,exports){
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
        entity.setTarget([x, y]);
    });
}

PointerManager.prototype.freeEntities = function () {
    this.entities.forEach(function (entity) {
        entity.free = true;
    });
}

module.exports = PointerManager;

},{}],4:[function(require,module,exports){
// calculate speed using Pythagoras' formula
function calculateDistance (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calculateAngle (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.atan2(dy, dx);
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
    calculateDistance: calculateDistance,
    calculateAngle: calculateAngle,
    withinCircle: withinCircle
};

},{}],5:[function(require,module,exports){
// The cursor pointer is a pointer
// whose position is always equal
// to the mouse's position

var Pointer = require("../Pointer");

Cursor.prototype = new Pointer(0, 0);
function Cursor() {
    var cursor = this;
    Pointer.apply(this, arguments);

    function update (event) {
        cursor[0] = event.clientX;
        cursor[1] = event.clientY;
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
var geometry = require("../geometry");

// this is an abstract class, treat it as such.
PhysicsPointer.prototype = new Pointer(0, 0);
/**
 * Attributes
 * @attribute target           {[x, y]} The target this pointer is using to calculate its next position
 * @attribute previousPosition {[x, y]} The previous position of the pointer
 * @attribute free             {bool}   True if it should respond to user-input, false otherwise
 * @attribute dead             {bool}   Pointer won't move anymore when it is dead, you shouldn't have to set this yourself
 * @attribute speed            {number} Current speed of the pointer
 * @attribute angle            {number} The direction the pointer is currently going in in radians
 */
function PhysicsPointer() {
    Pointer.apply(this, arguments);
    this.target = [this[0], this[1]];
}

PhysicsPointer.prototype.setTarget = function (target) {
    if (!this.free) {
        this.target = target;
    }
};

PhysicsPointer.prototype.step = function() {
    console.log("Please implement the step function for your pointer");
};

PhysicsPointer.prototype.beforeStep = function () {
    this.previousPosition = [this[0], this[1]];
};

PhysicsPointer.prototype.afterStep = function after() {
    if (! this.previousPosition) {
        throw new ReferenceError("You've forgotten a `beforeStep` call in your step function");
    }

    this.speed = geometry.calculateDistance(this, this.previousPosition);
    this.angle = geometry.calculateAngle(this, this.previousPosition);

    if (this.speed <= 0.01 && this.free) {
        this.dead = true;
    } else {
        this.notifyPositionChangedListeners();
    }
};

module.exports = PhysicsPointer;

},{"../Pointer":2,"../geometry":4}],7:[function(require,module,exports){
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
    this.beforeStep();

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

        this.afterStep();
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
    this.beforeStep();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this[0] += dx * this.stepSize;
        this[1] += dy * this.stepSize;

       this.afterStep();
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
    this.beforeStep();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this.velocity[0] += dx * this.scale;
        this.velocity[1] += dy * this.scale;
        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;

        this[0] += this.velocity[0];
        this[1] += this.velocity[1];

        this.afterStep();
    }
};

module.exports = Swinger;

},{"./PhysicsPointer":6}],10:[function(require,module,exports){
var Pointer = require("../Pointer");

function _bootstrapMirror(fn) {
    return function(originalPointer, origin) {
        var initialPosition = fn(originalPointer, origin);
        var copy = new Pointer(initialPosition[0], initialPosition[1]);
        copy.rotation = originalPointer.rotation;
        copy.origin = origin;
        copy.setDrawingFunction(originalPointer.drawFn);

        originalPointer.onPositionChanged(function() {
            if (copy[0] !== undefined && copy[1] !== undefined) {
                copy.previousPosition = [copy[0], copy[1]];
            }

            // position is calculated by the passed function
            var newPosition = fn(originalPointer, origin);
            copy[0] = newPosition[0];
            copy[1] = newPosition[1];

            if (originalPointer.afterStep) {
                originalPointer.afterStep.call(copy);
            }
            copy.drawFn();
        });
    };
}

var _mirrorHorizontal = _bootstrapMirror(function(originalPointer, origin) {
    return [origin[0] + origin[0] - originalPointer.x,
            originalPointer.y];
});

var _mirrorVertical = _bootstrapMirror(function(originalPointer, origin) {
    return [originalPointer.x,
            origin[1] + origin[1] - originalPointer.y];
});

var _mirrorDiagonal = _bootstrapMirror(function(originalPointer, origin) {
    return [origin[0] + origin[0] - originalPointer.x,
            origin[1] + origin[1] - originalPointer.y];
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
 * so speed and angle can be accessed from the mirror pointer.
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

},{"../Pointer":2}]},{},[1])(1)
});