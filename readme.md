# Wind -- An abstraction over user-input

Wind is a library part of my ongoing exploration of the computer as a digital art form. Wind exposes a concept called a `pointer`, which takes the place of the `position` vector often used physics simulations, games and drawing programs. While this library is primarily developed for use in drawing programs, it's completely independent of this concept, and can be used in all kinds of programs.

Additionally, wind is completely decoupled from any rendering technology, feel free to use it with svg, html elements or the canvas. Note however, the library is based around 2D positions, 3D is not supported.

## What does it do?

Wind exposes a concept called a `pointer` which takes the place of the `position` vector often used in games or physics simulations. This decoupling of the `position` from the physics-objects comes with a few nice advantages. First of all, motions are completely reusable and configurable.

Because the pointers are separate objects from the rendered objects, it is possible to manipulate them in more interesting ways than traditional `position` attributes. This additional flexibility is the primary reason this library was developed. For example, you can start playing around with "mirrors", where the cursor is mirrored using various symmetries.

Another possibility is to use simple mouse motions to spawn large amounts of pointers, which can then be used for particles, vine or tree-like growth, throwing chains and all kinds of other interesting stuff.

The key takeaway here is that one renderable object can be reused with **all** these kinds of interesting configurable motions. When the library grows, a simple function

```js
function drawCircle(ctx) {
    ctx.beginPath();
    ctx.arc(this.position[0], this.position[1], 5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.color = "skyblue";
    ctx.fill();
}
```

Can be recycled as a cursor, a stamp-like brush, a particle for a particle gun all with predefined cursor behaviors with exactly the same API.

A project like this is best explained with demos, so I advise you to look through the annotated demos page. (WIP)

Unfortunately, most written here is the *intent* of the library, right now, only few motions exist, and experimentation with symmetries and particle spawners needs to be done before all this is possible. As stated in the head of this readme, this library is part of my *ongoing exploration of the computer as a digital art form*.

## What's in the box?

There are a few pre-defined motions available.

#### Cursor
There's the `cursor` pointer, which tracks the mouse's position.

#### Stalker
The stalker follows behind the mouse [demo](no demo available yet!) with a short delay. Every frame, it moves `n`% closer to its target, usually the mouse. This results in a very smooth motion useful for all kinds of tracking behavior.

Examples: use the stalker as the position for the camera with the player's position as it's target.

#### Swinger
The swinger acts like a ball on an elastic rope. It's practically a spring-system.

## How does it work?

The whole library is structured using prototypal OOP. Instances of pointers can be created

```js
// set up some drawing
var ctx = someSetupFunction();

// a manager needs to be created in order to use pointers
var pointerManager = new PointerManager();

function drawCircle(ctx, pointer) {
    ctx.beginPath();
    ctx.arc(pointer[0], pointer[1], 5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.color = "skyblue";
    ctx.fill();
}

var cursor = new Cursor();
cursor.onPositionChanged(function () {
    // the pointer can be accessed using `this`
    // do NOT reference the pointer by `cursor`, only use this!
    // this is important for mirrors/symmetries
    drawCircle(ctx, this);
});
```

## Use `wind` in your project

Install wind using npm, `npm install wind`
