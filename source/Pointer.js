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
