var copyAttributesToObject = require("../util").copyAttributesToObject;
var Pointer = require("../Pointer");

function _bootstrapMirror(fn) {
    return function (originalPointer, origin) {
        var copy = new Pointer(originalPointer[0], originalPointer[1]);
        copy.setDrawingFunction(originalPointer.drawFn);

        originalPointer.onPositionChanged(function () {
            if (copy[0] !== undefined && copy[1] !== undefined) {
                copy.previousPosition = [copy[0], copy[1]];
            } else {
                copy.previousPosition = [originalPointer[0], originalPointer[1]];
            }
            // position is calculated by the passed function
            fn(copy, originalPointer, origin);
            if (originalPointer.afterStep) {
                originalPointer.afterStep.call(copy);
            }
            // copy.notifyPositionChangedListeners();
            copy.drawFn();
        });
    };
}

var _mirrorHorizontal = _bootstrapMirror(function (copy, originalPointer, origin) {
    copy[0] = origin[0] + origin[0] - originalPointer[0];
    copy[1] = originalPointer[1];
});

var _mirrorVertical = _bootstrapMirror(function (copy, originalPointer, origin) {
    copy[0] = originalPointer[0];
    copy[1] = origin[1] + origin[1] - originalPointer[1];
});

var _mirrorDiagonal = _bootstrapMirror(function (copy, originalPointer, origin) {
    copy[0] = origin[0] + origin[0] - originalPointer[0];
    copy[1] = origin[1] + origin[1] - originalPointer[1];
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
