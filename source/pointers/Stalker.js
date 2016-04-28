Stalker.prototype = new PhysicsPointer();
function Stalker(ctx) {
    PhysicsPointer.apply(this, arguments);
    this.stepSize = 0.05;
    this.speed = 0;
}

Stalker.prototype.step = function() {
    var previousPosition = [this[0], this[1]];

    if (this[0]) {
        var dx = this.target[0] - this[0];
        var dy = this.target[1] - this[1];

        this[0] += dx * this.stepSize;
        this[1] += dy * this.stepSize;

        // speed is calculated using
        // Pythagoras' formula between
        // last position and current position
        this.speed = Math.sqrt(Math.pow(previousPosition[0] - this[0], 2) + Math.pow(previousPosition[1] - this[1], 2));
        this.notifyPositionChangedListeners();
    }
};
