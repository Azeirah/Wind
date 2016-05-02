// calculate speed using Pythagoras' formula
function calculateDistance (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function calculateAngle (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.atan2(dy, dx);
}

/**
 * Calculates if a point lies within or outside a circle of given radius
 * @param  {[number, number]} origin, origin of the circle
 * @param  {[number, number]} point, point to check
 * @return {boolean}
 */
function withinCircle(origin, point, radius) {
    return calculateDistance(origin, point) <= radius;
}

module.exports = {
    calculateDistance: calculateDistance,
    calculateAngle: calculateAngle,
    withinCircle: withinCircle
};
