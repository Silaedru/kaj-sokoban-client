
class Game {
    render() {
        window.requestAnimationFrame(() => {
            const r = this._renderer;
            r.clear();

            this._map.getRenderableObjects().forEach(renderable => r.render(renderable));
            r.render(this._player.getRenderable());
        });
    }

    restoreState(state) {
        this._map._width = state.map.width;
        this._map._height = state.map.height;
        this._map._mapObjects = state.map.mapObjects;
        this._map._targets = state.map.targets;

        this._player._x = state.player.x;
        this._player._y = state.player.y;
        this._player._lastDir = state.player.direction;

        this.render();
    }

    undoMove() {
        if (this._states.length > 0) {
            this._moves.pop();
            this.restoreState(this._states.pop());
        }
    }

    move(direction) {
        const mapObjectsState = this._map._mapObjects.slice();

        if (!this._map.handlePlayerMove(this._player._x, this._player._y, direction)) {
            this._states.push({
                map: {
                    width: this._map._width,
                    height: this._map._height,
                    mapObjects: mapObjectsState,
                    targets: this._map._targets.slice()
                },

                player: {
                    x: this._player._x,
                    y: this._player._y,
                    direction: this._player._lastDir
                }
            });

            this._moves.push({
                direction: direction,
                time: new Date()
            });

            switch (direction) {
                case Direction.LEFT: this._player.moveLeft(); break;
                case Direction.RIGHT: this._player.moveRight(); break;
                case Direction.UP: this._player.moveUp(); break;
                case Direction.DOWN: this._player.moveDown(); break;
            }

            this.render();

            // if any animation should be made after winning a game, do this check before rerendering
            if (this._map.checkGameWon())
                alert("game won");
        }
    }

    constructor(canvas) {
        this._map = new SokobanMap("{\n" +
            " \"width\":10,\n" +
            " \"height\":10,\n" +
            "\n" +
            " \"walls\":[8,9,10,11,12,64],\n" +
            " \"crates\":[45, 48],\n" +
            " \"targets\":[37],\n" +
            " \"player\":24\n" +
            "}");

        const playerStartCoords = this._map.getPlayerStartCoords();
        this._player = new Player(playerStartCoords.x, playerStartCoords.y);
        this._renderer = new CanvasGridRenderer(canvas, 15, 15);

        this._moves = [];
        this._states = [];
    }
}