//todo: consider checkbox for autosave, manual saving button?
const GameHelpers = {
    listeners: {
        keyDown: null,
        keyUp: null,
    },

    controlsInit: false,
    gameState: -1,
    game: null,

    registerKeyListeners: function() {
        GameHelpers.listeners.keyDown = e => GameHelpers.game.keyDownListener(e);
        GameHelpers.listeners.keyUp = e => GameHelpers.game.keyUpListener(e);

        document.addEventListener("keyup", GameHelpers.listeners.keyUp);
        document.addEventListener("keydown", GameHelpers.listeners.keyDown);
    },

    removeKeyListeners: function() {
        document.removeEventListener("keyup", GameHelpers.listeners.keyUp);
        document.removeEventListener("keydown", GameHelpers.listeners.keyDown);
    },

    initGameControls: function() {
        if (!GameHelpers.controlsInit) {
            document.querySelectorAll(".game-controls button").forEach(button => {
                const action = button.dataset.action;
                let desiredEffect = null;

                switch (action) {
                    case "up":
                        desiredEffect = () => GameHelpers.game.move(Direction.UP);
                        break;
                    case "left":
                        desiredEffect = () => GameHelpers.game.move(Direction.LEFT);
                        break;
                    case "down":
                        desiredEffect = () => GameHelpers.game.move(Direction.DOWN);
                        break;
                    case "right":
                        desiredEffect = () => GameHelpers.game.move(Direction.RIGHT);
                        break;
                    case "undo":
                        desiredEffect = () => GameHelpers.game.undoMove();
                        break;
                }

                if (desiredEffect) {
                    button.addEventListener("click", () => {
                        try {
                            desiredEffect();
                        } catch (e) {
                            // ignore error
                        }
                    });
                }
            });

            document.querySelector(".game-controls-settings input[data-action='show-controls']").addEventListener("change", (e) => {
                if (e.target.checked)
                    document.querySelector(".game-controls").classList.remove("hidden");
                else
                    document.querySelector(".game-controls").classList.add("hidden");
            });

            //todo: add confirmation for these
            document.querySelector("button[data-action='restart-game']").addEventListener("click", () => {
                GameHelpers.game.restartGame();
                GameHelpers.game.render();
            });
            document.querySelector("button[data-action='abandon-game']").addEventListener("click", () => {
                GameHelpers.game = null;
                GameHelpers.gameState = -1;
                GameHelpers.advanceGameState();
            });

            document.querySelector(".game-controls-settings input[data-action='lock-controls']").addEventListener("change", (e) => {
                const action = e.target.checked ? "disable" : "enable";
                $(".game-controls").draggable(action);
            });
            $(".game-controls").draggable();

            GameHelpers.controlsInit = true;
        }
    },

    startGame: function(map) {
        GameHelpers.advanceGameState();

        document.querySelector("#play > div[data-game-state ~= 'active-game']").style.display = "block";

        GameHelpers.registerKeyListeners();

        if (GameHelpers.game === null) {
            GameHelpers.game = 0; // to make sure game is no longer "null"

            loadResources().then(() => {
                const canvas = document.querySelector("canvas");
                GameHelpers.game = new Game(map.data, canvas, () => GameHelpers.advanceGameState());
                GameHelpers.game.render();

                GameHelpers.initGameControls();
            });
        }
    },

    advanceGameState: function() {
        GameHelpers.gameState = (GameHelpers.gameState + 1) % Object.keys(GameState).length;

        document.querySelectorAll("#play > div").forEach(element => element.style.display = "none");

        switch (GameHelpers.gameState) {
            case GameState.MAP_SELECT:
                GameHelpers.removeKeyListeners();
                document.querySelector("#play > div[data-game-state ~= 'map-select']").style.display = "block";
                MapUtils.loadMaps();
                break;

            case GameState.ACTIVE_GAME:
                break;

            case GameState.FINISHED_GAME:
                GameHelpers.removeKeyListeners();
                document.querySelector("#play > div[data-game-state ~= 'finished-game']").style.display = "block";
                GameHelpers.game = null;
                break;
        }
    },
};

