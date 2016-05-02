var Pointer = require("../Pointer");
var geometry = require("../geometry");

// this is an abstract class, treat it as such.
PhysicsPointer.prototype = new Pointer(0, 0);
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

PhysicsPointer.prototype.beforeStep = function () {
    this._previousPosition = [this[0], this[1]];
};

PhysicsPointer.prototype.afterStep = function after() {
    if (! this._previousPosition) {
        throw new ReferenceError("You've forgotten a `beforeStep` call in your step function");
    }
    this.speed = geometry.calculateDistance(this, this._previousPosition);
    this.angle = geometry.calculateAngle(this, this._previousPosition);
    // determine if a pointer is dead by the following reasoning
    // first, is the speed really low?
    // then check, is the pointer free? then it has stopped moving
    if (this.speed <= 0.01 && this.free) {
        this.dead = true;
    } else {
        this.notifyPositionChangedListeners();
    }
};

module.exports = PhysicsPointer;
