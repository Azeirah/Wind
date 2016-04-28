function Pointer() {
    var pointer = this;

    this.positionChangedListeners = {};

    // the pointer is considered "free" when it shouldn't
    // respond to user input anymore
    pointer.free = false;

    // the pointer is considered "dead" when it won't ever move anymore
    // when the pointer dies, it can be cleaned up.
    pointer.dead = false;

    // Are there more sensible defaults? Go lower? Undefined? 0? -1?
    pointer[0] = -10000;
    pointer[1] = -10000;
}

Pointer.prototype.setOrigin = function(origin) {
    this[0] = origin[0];
    this[1] = origin[1];
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
