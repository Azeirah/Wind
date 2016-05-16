var PhysicsPointer = require("./PhysicsPointer");

Stalker.prototype = new PhysicsPointer(0, 0);
function Stalker() {
    PhysicsPointer.apply(this, arguments);
    this.stepSize = 0.05;
    this.speed = 0;
}

Stalker.prototype.step = function() {
    this.beforeMove();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this[0] += dx * this.stepSize;
        this[1] += dy * this.stepSize;

       this.afterMove();
    }
};

module.exports = Stalker;
