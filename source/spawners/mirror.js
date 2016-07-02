 var Pointer = require("../Pointer");
 var geometry = require("../geometry.js");

/**
 * Higher-order function to generate mirrors, it gives the mirror pointer the right speed, origin, initial position, scaling, rotation.
 * All you have to do to create a new mirror is pass a function that computes a new position from the original pointer and an origin to mirror around
 * @param  {Function} fn [description]
 * @return {[type]}      [description]
 */
function _bootstrapMirror(fn) {
    return function(originalPointer, origin) {
        var pointerAttrs = fn(originalPointer, origin);
        var initialPosition = pointerAttrs.position;
        var copy = new Pointer(initialPosition[0], initialPosition[1]);
        copy.origin = initialPosition;
        copy.rotation = pointerAttrs.rotation;
        copy.offsetX = pointerAttrs.offsetX;
        copy.offsetY = pointerAttrs.offsetY;
        copy.setDrawingFunction(originalPointer.drawFn);

        originalPointer.onPositionChanged(function() {
            var pointerAttrs = fn(originalPointer, origin);
            copy.scaling = originalPointer.scaling;
            copy.rotation = pointerAttrs.rotation;
            copy.offsetX = pointerAttrs.offsetX;
            copy.offsetY = pointerAttrs.offsetY;
            originalPointer.beforeMove.call(copy);

            // position is calculated by the passed function
            var newPosition = pointerAttrs.position;
            copy[0] = newPosition[0];
            copy[1] = newPosition[1];

            originalPointer.afterMove.call(copy);

            copy.drawFn();
        });
    };
}

var _mirrorHorizontal = _bootstrapMirror(function(originalPointer, origin) {
    return {
        position: [
            origin[0] + origin[0] - originalPointer[0],
            originalPointer[1]
        ],
        // when mirroring, the original pointer's rotation needs to be mirrored as well.
        // Otherwise the pointer will rotate into the wrong direction, creating skewed paths
        rotation: -originalPointer.rotation,
        offsetX: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[0],
        offsetY: originalPointer.offsetY

    };
});

var _mirrorVertical = _bootstrapMirror(function(originalPointer, origin) {
    return {
        position: [
            originalPointer[0],
            origin[1] + origin[1] - originalPointer[1]
        ],
        rotation: -originalPointer.rotation,
        offsetX: originalPointer.offsetX,
        offsetY: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[1]
    };
});

var _mirrorDiagonal = _bootstrapMirror(function(originalPointer, origin) {
    return {
        position: [
            origin[0] + origin[0] - originalPointer[0],
            origin[1] + origin[1] - originalPointer[1]
        ],
        // the diagonal mirror's rotation should /not/ be inverted, it's going into the right direction already
        rotation: originalPointer.rotation,
        offsetX: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[0],
        offsetY: geometry.rotatePoint([originalPointer.offsetX, originalPointer.offsetY], [0, 0], Math.PI)[1],
    };
});

/**
 * Mirror takes a pointer and mirrors it in configurable ways.
 *
 * @param  {Pointer} pointer The pointer you want to mirror
 * @param  {string}  how     "horizontal" | "vertical" | "diagonal" | "4-way"
 * @param  {[x, y]}  origin  where to mirror from, by default you get a kaleidoscope effect
 *                           otherwise, you likely want to input the pointer's origin here
 *                           to get a local mirror effect
 *
 * examples:
 * mirror(pointer, "horizontal") // horizontal kaleidoscope
 * mirror(pointer, "diagonal", [pointer[0], pointer[1]]) // local diagonal mirroring
 *
 * All attributes of the original pointer are continuously copied to the mirrored pointer
 * so attributes like speed and direction can be accessed from the mirror pointer.
 */
function mirror(pointer, how, origin) {
    if (!origin) {
        origin = [ctx.canvas.width / 2, ctx.canvas.height / 2];
    } else {
        origin = [pointer[0], pointer[1]];
    }

    switch (how) {
        case "horizontal":
            _mirrorHorizontal(pointer, origin);
            break;
        case "vertical":
            _mirrorVertical(pointer, origin);
            break;
        case "diagonal":
            _mirrorDiagonal(pointer, origin);
            break;
        case "4-way":
            _mirrorHorizontal(pointer, origin);
            _mirrorVertical(pointer, origin);
            _mirrorDiagonal(pointer, origin);
            break;
    }
}

module.exports = mirror;
