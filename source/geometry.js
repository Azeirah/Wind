// calculate speed using Pythagoras' formula
function calculateSpeed (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calculateAngle (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.atan2(dy, dx);
}

module.exports = {
    calculateSpeed: calculateSpeed,
    calculateAngle: calculateAngle
};
