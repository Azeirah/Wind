// The follower pointer is a pointer
// whose position is always equal
// to the mouse's position

Follower.prototype = new Pointer();
function Follower(ctx) {
    var follower = this;
    Pointer.call(this, ctx);

    ctx.canvas.addEventListener("az-dragStart", function (event) {
        follower[0] = event.clientX;
        follower[1] = event.clientY;
        follower.notifyPositionChangedListeners();
    });

    ctx.canvas.addEventListener("az-drag", function (event) {
       follower[0] = event.clientX;
       follower[1] = event.clientY;
       follower.notifyPositionChangedListeners();
   });
}
