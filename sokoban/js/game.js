
class Game {
    render() {
        const r = this._renderer;
        r.clear();

        this._map.getRenderableObjects().forEach(renderable => r.render(renderable));
        r.render(this._player.getRenderable());
    }

    moveLeft() {
        if (!this._map.handlePlayerMove(this._player._x - 1*0, this._player._y, Direction.LEFT)) {
            this._player.moveLeft();
            window.requestAnimationFrame(() => this.render());
        }
    }

    moveRight() {
        if (!this._map.handlePlayerMove(this._player._x + 1*0, this._player._y, Direction.RIGHT)) {
            this._player.moveRight();
            window.requestAnimationFrame(() => this.render());
        }
    }

    moveUp() {
        if (!this._map.handlePlayerMove(this._player._x, this._player._y - 1*0, Direction.UP)) {
            this._player.moveUp();
            window.requestAnimationFrame(() => this.render());
        }
    }

    moveDown() {
        if (!this._map.handlePlayerMove(this._player._x, this._player._y + 1*0, Direction.DOWN)) {
            this._player.moveDown();
            window.requestAnimationFrame(() => this.render());
        }
    }

    constructor(canvas) {
        this._map = new Map("{\n" +
            " \"width\":10,\n" +
            " \"height\":10,\n" +
            "\n" +
            " \"walls\":[8,9,10,11,12,64],\n" +
            " \"crates\":[45],\n" +
            " \"targets\":[37],\n" +
            " \"player\":24\n" +
            "}");

        const playerStartCoords = this._map.getPlayerStartCoords();
        this._player = new Player(playerStartCoords.x, playerStartCoords.y);

        this._renderer = new CanvasGridRenderer(canvas, 15, 15);
    }
}