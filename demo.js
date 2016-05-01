// canvas ellipse polyfill
if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
    CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
        this.save();
        this.translate(x, y);
        this.rotate(rotation);
        this.scale(radiusX, radiusY);
        this.arc(0, 0, 5, startAngle, endAngle, antiClockwise);
        this.restore();
    }
}

Math.translate = function translate(value, leftMin, leftMax, rightMin, rightMax) {
    "use strict";
    var leftSpan = leftMax - leftMin;
    var rightSpan = rightMax - rightMin;
    var scaled = (value - leftMin) / leftSpan;

    return rightMin + scaled * rightSpan;
};

Math.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
};

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

function drawGrid(ctx, pointer) {
    var amount = 50;
    var gridSize = 50;
    var shadowLength = 8;

    var wallX = Math.round(pointer[0] / gridSize) * gridSize;
    var wallY = Math.round(pointer[1] / gridSize) * gridSize;
    var xShadow = (wallX - pointer[0]) * shadowLength;
    var yShadow = (wallY - pointer[1]) * shadowLength;

    ctx.strokeStyle = "rgba(255, 0, 0, 0.01)";

    for (var i = 0; i < amount; i++) {
        ctx.beginPath();
        ctx.moveTo(wallX, wallY);
        ctx.lineTo(wallX + Math.random() * xShadow, wallY + Math.random() * yShadow, wallX, wallY);
        ctx.stroke();
        ctx.closePath();
    }
}

function drawArrow(ctx, pointer) {
    var ratio = Math.translate(pointer.speed, 0, 50, 1, 0);
    ratio = Math.clamp(ratio, 0.3, 0.7);

    ctx.beginPath();
    ctx.ellipse(
        pointer[0],
        pointer[1],
        (pointer.speed / 10) * ratio,
        (pointer.speed / 10) * (1 - ratio),
        pointer.angle,
        0,
        2 * Math.PI
    );
    ctx.closePath();
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
        drawArrow(ctx, this);
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
