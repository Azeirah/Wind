function fullscreenCanvas() {
    "use strict";
    var drawing = Object.create(null);
    var stylesheet = document.createElement("style");
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    function resize() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;
    }

    stylesheet.innerHTML = "* {margin: 0; padding: 0; overflow: hidden;}";

    resize();
    window.addEventListener("resize", resize);

    document.body.appendChild(stylesheet);
    document.body.appendChild(canvas);

    drawing.canvas = canvas;
    drawing.ctx = ctx;

    return drawing;
}

function drawCircle(ctx, pointer) {
    ctx.beginPath();
    ctx.arc(pointer[0], pointer[1], pointer.speed, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.color = "skyblue";
    ctx.fill();
}

var drawing = fullscreenCanvas();
var ctx = drawing.ctx;
var canvas = drawing.canvas;

var pointerManager = new PointerManager();

// code like this is example code
// this project will be injected into a higher-level "brushes" codebase
// where this ugly code makes sense
canvas.addEventListener("az-dragStart", function(event) {
    var pointer = new Swinger(event.clientX, event.clientY);
    pointer.setDrawingFunction(function () {
        drawCircle(ctx, this);
    });

    mirror(pointer, "horizontal", true);

    pointer.onPositionChanged(function () {
        this.drawFn();
    });

    pointerManager.addEntity(pointer);
});

canvas.addEventListener("az-drag", function(event) {
    pointerManager.setTarget(event.clientX, event.clientY);
});

canvas.addEventListener("az-dragEnd", function() {
    pointerManager.entities.forEach(function (entity) {
        entity.friction = 0.9;
    });
    pointerManager.freeEntities();
});
