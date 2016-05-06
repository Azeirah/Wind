var Pointer = require("../Pointer");
var geometry = require("../geometry");

// this is an abstract class, treat it as such.
PhysicsPointer.prototype = new Pointer(0, 0);
/**
 * Attributes
 * @attribute target           {[x, y]} The target this pointer is using to calculate its next position
 * @attribute previousPosition {[x, y]} The previous position of the pointer
 * @attribute free             {bool}   True if it should respond to user-input, false otherwise
 * @attribute dead             {bool}   Pointer won't move anymore when it is dead, you shouldn't have to set this yourself
 * @attribute speed            {number} Current speed of the pointer
 * @attribute angle            {number} The direction the pointer is currently going in in radians
 */
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
    this.previousPosition = [this[0], this[1]];
};

PhysicsPointer.prototype.afterStep = function after() {
    if (! this.previousPosition) {
        throw new ReferenceError("You've forgotten a `beforeStep` call in your step function");
    }

    this.speed = geometry.calculateDistance(this, this.previousPosition);
    this.angle = geometry.calculateAngle(this, this.previousPosition);

    if (this.speed <= 0.01 && this.free) {
        this.dead = true;
    } else {
        this.notifyPositionChangedListeners();
    }
};

module.exports = PhysicsPointer;
