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
