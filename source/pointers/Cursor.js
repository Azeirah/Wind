// The cursor pointer is a pointer
// whose position is always equal
// to the mouse's position

var Pointer = require("../Pointer");

Cursor.prototype = new Pointer(0, 0);
function Cursor() {
    var cursor = this;
    Pointer.apply(this, arguments);

    document.body.addEventListener("az-dragStart", function (event) {
        cursor[0] = event.clientX;
        cursor[1] = event.clientY;
        cursor.notifyPositionChangedListeners();
    });

    document.body.addEventListener("az-drag", function (event) {
       cursor[0] = event.clientX;
       cursor[1] = event.clientY;
       cursor.notifyPositionChangedListeners();
   });
}

module.exports = Cursor;
