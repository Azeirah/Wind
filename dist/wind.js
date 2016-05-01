(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.wind = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// module.exports = {
//     PointerManager: require("./source/PointerManager"),
//     Follower: require("./source/pointers/Follower"),
//     Swinger: require("./source/pointers/Swinger"),
//     Stalker: require("./source/pointers/Stalker"),
//     Slider: require("./source/pointers/Slider"),
//     mirror: require("./source/spawners/mirror")
// };

global.PointerManager = require("./source/PointerManager");
global.Follower = require("./source/pointers/Follower");
global.Swinger = require("./source/pointers/Swinger");
global.Stalker = require("./source/pointers/Stalker");
global.Slider = require("./source/pointers/Slider");
global.mirror = require("./source/spawners/mirror");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./source/PointerManager":3,"./source/pointers/Follower":5,"./source/pointers/Slider":7,"./source/pointers/Stalker":8,"./source/pointers/Swinger":9,"./source/spawners/mirror":10}],2:[function(require,module,exports){
function Pointer(x, y) {
    var pointer = this;

    this.positionChangedListeners = {};

    // the pointer is considered "free" when it shouldn't
    // respond to user input anymore
    pointer.free = false;

    // the pointer is considered "dead" when it won't ever move anymore
    // when the pointer dies, it can be cleaned up.
    pointer.dead = false;

    pointer[0] = x;
    pointer[1] = y;
}

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
function calculateSpeed (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calculateAngle (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.atan2(dy, dx);
}

module.exports = {
    calculateSpeed: calculateSpeed,
    calculateAngle: calculateAngle
};

},{}],5:[function(require,module,exports){
// The follower pointer is a pointer
// whose position is always equal
// to the mouse's position

var Pointer = require("../Pointer");

Follower.prototype = new Pointer();
function Follower() {
    var follower = this;
    Pointer.apply(this, arguments);

    document.body.addEventListener("az-dragStart", function (event) {
        follower[0] = event.clientX;
        follower[1] = event.clientY;
        follower.notifyPositionChangedListeners();
    });

    document.body.addEventListener("az-drag", function (event) {
       follower[0] = event.clientX;
       follower[1] = event.clientY;
       follower.notifyPositionChangedListeners();
   });
}

module.exports = Follower;

},{"../Pointer":2}],6:[function(require,module,exports){
var Pointer = require("../Pointer");

// this is an abstract class, treat it as such.
PhysicsPointer.prototype = new Pointer();
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

module.exports = PhysicsPointer;

},{"../Pointer":2}],7:[function(require,module,exports){
var PhysicsPointer = require("./PhysicsPointer");
var geometry = require("../geometry");

Slider.prototype = new PhysicsPointer();
function Slider() {
    PhysicsPointer.apply(this, arguments);
    this.velocity = [0, 0];
    this.friction = .987;
    this.scale = 0.01;
}

Slider.prototype.step = function () {
    var previousPosition = [this[0], this[1]];

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

        this.speed = geometry.calculateSpeed(this, previousPosition);
        this.angle = geometry.calculateAngle(this, previousPosition);
        this.notifyPositionChangedListeners();
        if (this.speed <= 0.01) {
            this.dead = true;
        }
    }
};

module.exports = Slider;

},{"../geometry":4,"./PhysicsPointer":6}],8:[function(require,module,exports){
var PhysicsPointer = require("./PhysicsPointer");
var geometry = require("../geometry");

Stalker.prototype = new PhysicsPointer();
function Stalker(ctx) {
    PhysicsPointer.apply(this, arguments);
    this.stepSize = 0.05;
    this.speed = 0;
}

Stalker.prototype.step = function() {
    var previousPosition = [this[0], this[1]];

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this[0] += dx * this.stepSize;
        this[1] += dy * this.stepSize;

        this.speed = geometry.calculateSpeed(this, previousPosition);
        this.angle = geometry.calculateAngle(this, previousPosition);
        if (this.speed <= 0.01) {
            this.dead = true;
        }
        this.notifyPositionChangedListeners();
    }
};

module.exports = Stalker;

},{"../geometry":4,"./PhysicsPointer":6}],9:[function(require,module,exports){
var PhysicsPointer = require("./PhysicsPointer");
var geometry = require("../geometry");

Swinger.prototype = new PhysicsPointer();
function Swinger() {
    PhysicsPointer.apply(this, arguments);
    this.velocity = [0, 0];
    this.friction = .998;
    this.scale = 0.01;
}

Swinger.prototype.step = function() {
    var previousPosition = [this[0], this[1]];

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this.velocity[0] += dx * this.scale;
        this.velocity[1] += dy * this.scale;
        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;

        this[0] += this.velocity[0];
        this[1] += this.velocity[1];

        this.speed = geometry.calculateSpeed(this, previousPosition);
        this.angle = geometry.calculateAngle(this, previousPosition);
        if (this.speed <= 0.01) {
            this.dead = true;
        }
        this.notifyPositionChangedListeners();
    }
};

module.exports = Swinger;

},{"../geometry":4,"./PhysicsPointer":6}],10:[function(require,module,exports){
var copyAttributesToObject = require("../util").copyAttributesToObject;
var Pointer = require("../Pointer");

function _mirrorHorizontal(pointer, origin) {
    var p1 = new Pointer();
    p1.setDrawingFunction(pointer.drawFn);
    pointer.onPositionChanged(function () {
        copyAttributesToObject(pointer, p1);
        p1[0] = origin[0] + origin[0] - this[0];
        p1[1] = this[1];
        p1.drawFn();
    });
}

function _mirrorVertical(pointer, origin) {
    var p1 = new Pointer();
    p1.setDrawingFunction(pointer.drawFn);
    pointer.onPositionChanged(function () {
        copyAttributesToObject(pointer, p1);
        p1[0] = this[0];
        p1[1] = origin[1] + origin[1] - this[1];
        p1.drawFn();
    });
}

function _mirrorDiagonal(pointer, origin) {
    var p1 = new Pointer();
    p1.setDrawingFunction(pointer.drawFn);
    pointer.onPositionChanged(function () {
        copyAttributesToObject(pointer, p1);
        p1[0] = origin[0] + origin[0] - this[0];
        p1[1] = origin[1] + origin[1] - this[1];
        p1.drawFn();
    });
}

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

},{"../Pointer":2,"../util":11}],11:[function(require,module,exports){
function copyAttributesToObject(attributes, object) {
    // this removes functions and leaves us with only serializable types
    // which is what we care about
    var attrs = JSON.parse(JSON.stringify(attributes));

    for (var key in attrs) {
        object[key] = attrs[key];
    }
}

module.exports = {
    copyAttributesToObject: copyAttributesToObject
};

},{}]},{},[1])(1)
});