var Pointer = require("../Pointer");

function _bootstrapMirror(fn) {
    return function(originalPointer, origin) {
        var initialPosition = fn(originalPointer, origin);
        var copy = new Pointer(initialPosition[0], initialPosition[1]);
        copy.rotation = originalPointer.rotation;
        copy.origin = origin;
        copy.setDrawingFunction(originalPointer.drawFn);

        originalPointer.onPositionChanged(function() {
            if (copy[0] !== undefined && copy[1] !== undefined) {
                copy.previousPosition = [copy[0], copy[1]];
            }

            // position is calculated by the passed function
            var newPosition = fn(originalPointer, origin);
            copy[0] = newPosition[0];
            copy[1] = newPosition[1];

            if (originalPointer.afterMove) {
                originalPointer.afterMove.call(copy);
            }
            copy.drawFn();
        });
    };
}

var _mirrorHorizontal = _bootstrapMirror(function(originalPointer, origin) {
    return [origin[0] + origin[0] - originalPointer.x,
            originalPointer.y];
});

var _mirrorVertical = _bootstrapMirror(function(originalPointer, origin) {
    return [originalPointer.x,
            origin[1] + origin[1] - originalPointer.y];
});

var _mirrorDiagonal = _bootstrapMirror(function(originalPointer, origin) {
    return [origin[0] + origin[0] - originalPointer.x,
            origin[1] + origin[1] - originalPointer.y];
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
 * so speed and angle can be accessed from the mirror pointer.
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
