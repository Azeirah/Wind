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
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);

    var xRotated = (point[0] - origin[0]) * cos - (point[1] - origin[1]) * sin;
    var yRotated = (point[0] - origin[0]) * sin + (point[1] - origin[1]) * cos;

    var x = xRotated + origin[0];
    var y = yRotated + origin[1];

    return [x, y];
}

/**
 * Scales a point from an origin, a point at (5, 5) with a scale of two and origin of (0, 0) will be at (10, 10)
 * @param  {[type]} point  The point you want to scale
 * @param  {[type]} origin The origin you want to scale from
 * @param  {[type]} scale  How much you want to scale, 1 means no scaling, 0.5 means half, 2 means double etc...
 * @return {[type]}        The new scaled point
 */
function scalePoint (point, origin, scale) {
    var x = point[0] + (point[0] - origin[0]) * scale;
    var y = point[1] + (point[1] - origin[1]) * scale;

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
    calculateDistance : calculateDistance,
    calculateAngle    : calculateAngle,
    withinCircle      : withinCircle,
    rotatePoint       : rotatePoint,
    scalePoint        : scalePoint
};
