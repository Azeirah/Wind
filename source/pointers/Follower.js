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
