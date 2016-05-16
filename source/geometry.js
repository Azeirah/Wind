/**
 * Calculate a distance using pythagoras' formula
 * @param  {[x, y]} firstPoint  The first point
 * @param  {[x, y]} secondPoint The second point
 * @return {number}             Distance between the two points
 */
function calculateDistance (firstPoint, secondPoint) {
    var dx = firstPoint[0] - secondPoint[0];
    var dy = firstPoint[1] - secondPoint[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

/**
 * Calculate the angle between two points
 * @param  {[x, y]} firstPoint  The first point
 * @param  {[x, y]} secondPoint The second point
 * @return {number}             Angle between the two points
 */
function calculateAngle (firstPoint, secondPoint) {
    var dx = firstPoint[0] - secondPoint[0];
    var dy = firstPoint[1] - secondPoint[1];

    return Math.atan2(dy, dx);
}

/**
 * Rotate a point around an origin with angle `angle`
 * @param  {[x, y]} point  The point you want to rotate
 * @param  {[x, y]} origin An origin you want to rotate around
 * @param  {number} angle  How much the point should be rotated in radians
 * @return {[x, y]}        The rotated point
 */
function rotatePoint (point, origin, angle) {
    var x = origin[0] +
      (point[0] - origin[0]) * Math.cos(angle) +
      (point[1] - origin[1]) * Math.sin(angle);

    var y = origin[1] +
      (point[0] - origin[0]) * Math.sin(angle) +
      (point[1] - origin[1]) * Math.cos(angle);

    return [x, y];
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
    withinCircle: withinCircle,
    rotatePoint: rotatePoint,
};
