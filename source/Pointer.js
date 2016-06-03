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
}

Object.defineProperties(Pointer.prototype, {
    x: {
        get: function () {
            return geometry.scalePoint(geometry.rotatePoint(this, this.origin, this.rotation), this.origin, this.scaling)[0];
        }
    },
    y: {
        get: function () {
            return geometry.scalePoint(geometry.rotatePoint(this, this.origin, this.rotation), this.origin, this.scaling)[1];
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
