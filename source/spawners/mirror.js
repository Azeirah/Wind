function _mirrorHorizontal(pointer, origin) {
    var p1 = new Pointer();
    p1.setDrawingFunction(pointer.drawFn);
    pointer.onPositionChanged(function () {
        copyAttributesToObject(pointer, p1);
        p1[0] = origin[0] + origin[0] - this[0];
        p1[1] = this[1];
        p1.drawFn();
    });
}

function _mirrorVertical(pointer, origin) {
    var p1 = new Pointer();
    p1.setDrawingFunction(pointer.drawFn);
    pointer.onPositionChanged(function () {
        copyAttributesToObject(pointer, p1);
        p1[0] = this[0];
        p1[1] = origin[1] + origin[1] - this[1];
        p1.drawFn();
    });
}

function _mirrorDiagonal(pointer, origin) {
    var p1 = new Pointer();
    p1.setDrawingFunction(pointer.drawFn);
    pointer.onPositionChanged(function () {
        copyAttributesToObject(pointer, p1);
        p1[0] = origin[0] + origin[0] - this[0];
        p1[1] = origin[1] + origin[1] - this[1];
        p1.drawFn();
    });
}

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
