var Pointer = require("../Pointer");

PhysicsPointer.prototype = new Pointer(0, 0);
/**
 * PhysicsPointer is a base-class for pointers that rely on differential equations for movement. In other words, if your pointer deals with velocity/friction/jerk/gravity and a step function to move, use the PhysicsPointer
 * @inheritDoc
 * @attribute target {[x, y]} The target this pointer is using to calculate its next position
 */
function PhysicsPointer() {
    Pointer.apply(this, arguments);
    this.target = [this[0], this[1]];
}

PhysicsPointer.prototype.setTarget = function (x, y) {
    if (!this.free) {
        this.target[0] = x;
        this.target[1] = y;
    }
};

PhysicsPointer.prototype.step = function() {
    throw new ReferenceError("An object inheriting from PhysicsPointer is missing its step function");
};

module.exports = PhysicsPointer;
