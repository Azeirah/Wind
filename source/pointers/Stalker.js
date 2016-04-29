Stalker.prototype = new PhysicsPointer();
function Stalker(ctx) {
    PhysicsPointer.apply(this, arguments);
    this.stepSize = 0.05;
    this.speed = 0;
}

Stalker.prototype.step = function() {
    var previousPosition = [this[0], this[1]];

    if (!this.dead) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this[0] += dx * this.stepSize;
        this[1] += dy * this.stepSize;

        this.speed = geometry.calculateSpeed(this, previousPosition);
        this.speed = geometry.calculateAngle(this, previousPosition);
        if (this.speed <= 0.01) {
            this.dead = true;
        }
        this.notifyPositionChangedListeners();
    }
};
