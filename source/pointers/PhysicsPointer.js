// this is an abstract class, treat it as such.
PhysicsPointer.prototype = new Pointer();
function PhysicsPointer() {
    Pointer.apply(this, arguments);
    this.target = [this[0], this[1]];
}

PhysicsPointer.prototype.setTarget = function (target) {
    if (!this.free) {
        this.target = target;
    }
};

PhysicsPointer.prototype.step = function() {
    console.log("Please implement the step function for your pointer");
};
