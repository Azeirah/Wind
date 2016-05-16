var PhysicsPointer = require("./PhysicsPointer");

Swinger.prototype = new PhysicsPointer(0, 0);
function Swinger() {
    PhysicsPointer.apply(this, arguments);
    this.velocity = [0, 0];
    this.friction = 0.998;
    this.scale = 0.01;
}

Swinger.prototype.step = function() {
    this.beforeMove();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this.velocity[0] += dx * this.scale;
        this.velocity[1] += dy * this.scale;
        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;

        this[0] += this.velocity[0];
        this[1] += this.velocity[1];

        this.afterMove();
    }
};

module.exports = Swinger;
