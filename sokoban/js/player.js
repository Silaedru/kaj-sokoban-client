/**
 * Possible movement directions
 */
const Direction = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
};

/**
 * Class representing a player
 */
class Player {

    /**
     * Returns object to render as a player object
     * @returns {GridRenderable} player renderable object
     */
    getRenderable() {
        let resource = null;

        // select resource to return based on the last performed move direction
        switch (this._lastDir) {
            case Direction.LEFT: resource = Resources.Player.left.resource; break;
            case Direction.RIGHT: resource = Resources.Player.right.resource; break;
            case Direction.UP: resource = Resources.Player.up.resource; break;
            case Direction.DOWN: resource = Resources.Player.down.resource; break;
        }

        return new GridRenderable(resource, this._x, this._y);
    }

    /**
     * Moves the player in the up direction
     */
    moveUp() {
        this._y--;
        this._lastDir = Direction.UP;
    }

    /**
     * Moves the player in the down direction
     */
    moveDown() {
        this._y++;
        this._lastDir = Direction.DOWN;
    }

    /**
     * Moves the player to the left
     */
    moveLeft() {
        this._x--;
        this._lastDir = Direction.LEFT;
    }

    /**
     * Moves the player to the right
     */
    moveRight() {
        this._x++;
        this._lastDir = Direction.RIGHT;
    }

    /**
     * Constructs a player object
     * @param x {number} grid x position of the player
     * @param y {number} grid y position of the player
     */
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._lastDir = Direction.DOWN;
    }
}