function copyAttributesToObject(attributes, object) {
    // this removes functions and leaves us with only serializable types
    // which is what we care about
    var attrs = JSON.parse(JSON.stringify(attributes));

    for (var key in attrs) {
        object[key] = attrs[key];
    }
}

var geometry = {};

// calculate speed using Pythagoras' formula
geometry.calculateSpeed = function (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};

geometry.calculateAngle = function (lastPosition, currentPosition) {
    var dx = lastPosition[0] - currentPosition[0];
    var dy = lastPosition[1] - currentPosition[1];

    return Math.atan2(dy, dx);
};
