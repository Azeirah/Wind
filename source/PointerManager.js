function PointerManager(ctx) {
    var engine = this;
    // this is the code that manages all the physics objects
    // calls their step functions and their render functions
    // make sure to instantiate the engine before creating
    // PhysicsPointer objects
    this.entities = [];
    this.ctx = ctx;

    function cleanup() {
        engine.entities = engine.entities.filter(function (entity) {
            return !entity.dead;
        });
    }

    function step() {
        engine.entities.forEach(function(entity) {
            if (!entity.dead) {
                entity.step();
            }
        });

        cleanup();
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

PointerManager.prototype.addEntity = function (entity) {
    this.entities.push(entity);
};

PointerManager.prototype.setTarget = function (x, y) {
    this.entities.forEach(function(entity) {
        entity.setTarget([x, y]);
    });
}

PointerManager.prototype.freeEntities = function () {
    this.entities.forEach(function (entity) {
        entity.free = true;
    });
}
