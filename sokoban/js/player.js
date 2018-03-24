
const Direction = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
};

class Player {

    getRenderable() {
        let resource = null;

        switch (this._lastDir) {
            case Direction.LEFT: resource = Resources.Player.left.resource; break;
            case Direction.RIGHT: resource = Resources.Player.right.resource; break;
            case Direction.UP: resource = Resources.Player.up.resource; break;
            case Direction.DOWN: resource = Resources.Player.down.resource; break;
        }

        return new GridRenderable(resource, this._x, this._y);
    }

    moveUp() {
        this._y--;
        this._lastDir = Direction.UP;
    }

    moveDown() {
        this._y++;
        this._lastDir = Direction.DOWN;
    }

    moveLeft() {
        this._x--;
        this._lastDir = Direction.LEFT;
    }

    moveRight() {
        this._x++;
        this._lastDir = Direction.RIGHT;
    }

    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._lastDir = Direction.DOWN;
    }
}