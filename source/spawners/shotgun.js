function shotgun(pointer, ctx) {
    var shots = [];

    for (var i = 0; i < 23; i++) {
        var cursor = new Pointer();
        shots.push({
            offsetX: Math.random() * 170,
            offsetY: Math.random() * 170,
            cursor: cursor
        });
        cursor.setDrawingFunction(pointer.drawFn);
    }

    pointer.onPositionChanged(function () {
        shots.forEach(function (shot) {
            copyAttributesToObject(pointer, shot);
            shot.cursor[0] = pointer[0] + shot.offsetX;
            shot.cursor[1] = pointer[1] + shot.offsetY;
            shot.cursor.drawFn();
        });
    });
}
