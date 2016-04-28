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
