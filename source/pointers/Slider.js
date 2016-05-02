var PhysicsPointer = require("./PhysicsPointer");

Slider.prototype = new PhysicsPointer(0, 0);
function Slider() {
    PhysicsPointer.apply(this, arguments);
    this.velocity = [0, 0];
    // empirically chosen value
    this.friction = .987;
    this.scale = 0.01;
}

Slider.prototype.step = function () {
    this.beforeStep();

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        if (!this.free) {
            this.velocity[0] += dx * this.scale;
            this.velocity[1] += dy * this.scale;
        }

        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;

        this[0] += this.velocity[0];
        this[1] += this.velocity[1];

        this.afterStep();
    }
};

module.exports = Slider;
