
const GameState = {
    MAP_SELECT: 0,
    ACTIVE_GAME: 1,
    FINISHED_GAME: 2,
    SCORE_TABLE: 3
};

class Game {
    keyDownListener(e) {
        // prevent default behaviour when key that is processed separately is pressed
        switch (e.keyCode) {
            case KeyCode.KEY_LEFT:
            case KeyCode.KEY_A:
            case KeyCode.KEY_RIGHT:
            case KeyCode.KEY_D:
            case KeyCode.KEY_DOWN:
            case KeyCode.KEY_S:
            case KeyCode.KEY_UP:
            case KeyCode.KEY_W:
            case KeyCode.KEY_BACKSPACE:
                break;
            default:
                return;
        }
        e.preventDefault();
    }

    keyUpListener(e) {
        switch (e.keyCode) {
            case KeyCode.KEY_LEFT:
            case KeyCode.KEY_A:
                this.move(Direction.LEFT);
                break;

            case KeyCode.KEY_RIGHT:
            case KeyCode.KEY_D:
                this.move(Direction.RIGHT);
                break;

            case KeyCode.KEY_DOWN:
            case KeyCode.KEY_S:
                this.move(Direction.DOWN);
                break;

            case KeyCode.KEY_UP:
            case KeyCode.KEY_W:
                this.move(Direction.UP);
                break;

            case KeyCode.KEY_BACKSPACE:
                this.undoMove();
                break;

            default:
                return;
        }

        e.preventDefault();
    }

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

            GameHelpers.playClickAudio()
        }
    }

    move(direction) {
        const mapObjectsState = this._map._mapObjects.slice();

        if (!this._map.handlePlayerMove(this._player._x, this._player._y, direction)) {
            GameHelpers.playClickAudio();

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

            if (this._map.checkGameWon())
                this._victoryCallback();
        }
    }

    restartGame() {
        this._map = new SokobanMap(this._mapData);

        const playerStartCoords = this._map.getPlayerStartCoords();
        this._player = new Player(playerStartCoords.x, playerStartCoords.y);

        this._moves = [];
        this._states = [];
    }

    constructor(mapData, canvas, victoryCallback) {
        // clone the original map data in case we want to reset the game
        this._mapData = JSON.parse(JSON.stringify(mapData));
        this._victoryCallback = victoryCallback;

        // initialize everything
        this.restartGame();
        this._renderer = new CanvasGridRenderer(canvas, this._map._width, this._map._height);

        // rerender on resize
        window.addEventListener("resize", () => this.render(), true);
    }
}