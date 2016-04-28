// this is an abstract class, treat it as such.
PhysicsPointer.prototype = new Pointer();
function PhysicsPointer(ctx) {
    Pointer.call(this, ctx);
    this.target = [];
}

PhysicsPointer.prototype.setTarget = function (target) {
    if (!this.free) {
        this.target = target;
    }
};

PhysicsPointer.prototype.step = function() {
    console.log("Please implement the step function for your pointer");
};
