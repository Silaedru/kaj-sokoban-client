/**
 * Game states
 */
const GameState = {
    MAP_SELECT: 0,
    ACTIVE_GAME: 1,
    FINISHED_GAME: 2,
    SCORE_TABLE: 3
};

/**
 * Logic of an individual game
 */
class Game {
    /**
     * Handles a keyboard key press
     * @param e {KeyboardEvent} keyboard event that occurred
     */
    keyDownListener(e) {
        // this function blocks default behaviour of a key that will be handled once released

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

    /**
     * Handles a keyboard key release
     * @param e {KeyboardEvent} keyboard event that occurred
     */
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
                return; // don't block behaviour of a key that wasn't handled
        }

        e.preventDefault(); // block default behaviour of handled key
    }

    /**
     * Renders the game
     */
    render() {
        window.requestAnimationFrame(() => {
            const r = this._renderer;
            r.clear(); // clear canvas before rendering

            this._map.getRenderableObjects().forEach(renderable => r.render(renderable)); // render map objects
            r.render(this._player.getRenderable()); // render the player
        });
    }

    /**
     * Sets the game to a specified state
     * @param state {State} state object containing the target state data
     */
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

    /**
     * Undoes the last move
     */
    undoMove() {
        if (this._states.length > 0) {
            this._moves.pop();
            this.restoreState(this._states.pop());

            GameHelpers.playClickAudio()
        }
    }

    /**
     * Performs a move in specified direction
     * @param direction {Direction} direction in which to perform the move
     */
    move(direction) {
        const mapObjectsState = this._map._mapObjects.slice();

        // in case of valid move
        if (!this._map.handlePlayerMove(this._player._x, this._player._y, direction)) {
            GameHelpers.playClickAudio(); // play the move audio

            // add current state to the state history
            /**
             * @name State
             */
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

            // add current move to the move history
            this._moves.push({
                direction: direction,
                time: new Date()
            });

            // move the player object
            switch (direction) {
                case Direction.LEFT: this._player.moveLeft(); break;
                case Direction.RIGHT: this._player.moveRight(); break;
                case Direction.UP: this._player.moveUp(); break;
                case Direction.DOWN: this._player.moveDown(); break;
            }

            // rerender the game
            this.render();

            // check if the move completed the game
            if (this._map.checkGameWon())
                this._victoryCallback();
        }
    }

    /**
     * Resets the game to its initial state
     */
    restartGame() {
        this._map = new SokobanMap(this._mapData); // reload map

        // reset player position
        const playerStartCoords = this._map.getPlayerStartCoords();
        this._player = new Player(playerStartCoords.x, playerStartCoords.y);

        // clear past moves and states
        this._moves = [];
        this._states = [];
    }

    /**
     * Initializes a game
     * @param mapData object with the map data
     * @param canvas {HTMLCanvasElement} canvas object which will be used for rendering
     * @param victoryCallback {function} function to be called when the game is won
     */
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