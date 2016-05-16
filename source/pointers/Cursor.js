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
