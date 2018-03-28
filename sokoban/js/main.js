
const sectionActions = [
    {name: "play", loadAction: loadGame, unloadAction: pauseGame}
];

const GameState = {
    MAP_SELECT: 0,
    ACTIVE_GAME: 1,
    FINISHED_GAME: 2
};

const tempMapData = "{\n" +
    " \"width\":20,\n" +
    " \"height\":12,\n" +
    "\n" +
    " \"walls\":[8,9,10,11,12,64],\n" +
    " \"crates\":[45, 48],\n" +
    " \"targets\":[37],\n" +
    " \"player\":24\n" +
    "}";

let gameState = -1;
let game = null;
let controlsInit = false;

function advanceGameState() {
    gameState = (gameState + 1) % Object.keys(GameState).length;

    document.querySelectorAll("#play > div").forEach(element => element.style.display = "none");

    //todo: optimize
    switch (gameState) {
        case GameState.MAP_SELECT:
            document.querySelector("#play > div[data-game-state ~= 'map-select']").style.display = "block";
            break;

        case GameState.ACTIVE_GAME:
            document.querySelector("#play > div[data-game-state ~= 'active-game']").style.display = "block";

            if (game === null) {
                game = 0; // to make sure game is no longer "null"

                loadResources().then(() => {
                    const canvas = document.querySelector("canvas");
                    game = new Game(tempMapData, canvas, () => advanceGameState());

                    document.addEventListener("keyup", game.keyUpListener);
                    document.addEventListener("keydown", game.keyDownListener);

                    game.render();

                    initGameControls();
                });
            }
            break;

        case GameState.FINISHED_GAME:
            document.querySelector("#play > div[data-game-state ~= 'finished-game']").style.display = "block";
            break;
    }
}

function loadGame() {
    advanceGameState();
}

function pauseGame() {
    if (game instanceof Game) {
        document.removeEventListener("keyup", game.keyUpListener);
        document.removeEventListener("keydown", game.keyDownListener);
    }
}

function initGameControls() {
    if (!controlsInit) {
        document.querySelectorAll(".game-controls button").forEach(button => {
            const action = button.dataset.action;
            let desiredEffect = null;

            switch (action) {
                case "up":
                    desiredEffect = () => game.move(Direction.UP);
                    break;
                case "left":
                    desiredEffect = () => game.move(Direction.LEFT);
                    break;
                case "down":
                    desiredEffect = () => game.move(Direction.DOWN);
                    break;
                case "right":
                    desiredEffect = () => game.move(Direction.RIGHT);
                    break;
                case "undo":
                    desiredEffect = () => game.undoMove();
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

        // this listener and the line after it (enabling draggable on the .game-controls) are the only jquery dependencies in this project
        document.querySelector(".game-controls-settings input[data-action='lock-controls']").addEventListener("change", (e) => {
            const action = e.target.checked ? "disable" : "enable";
            $(".game-controls").draggable(action);
        });
        $(".game-controls").draggable();

        controlsInit = true;
    }
}

function findSectionByHashName(sectionHashName) {
    const rtn = sectionActions.filter(section => section.name === sectionHashName);

    if (rtn.length === 1)
        return rtn[0];

    return null;
}

function unloadCurrentSection(nextSection) {
    const _section = findSectionByHashName(window.location.hash.substr(1));

    if (_section !== null)
        if (_section.unloadAction !== null)
            _section.unloadAction();

    loadSection(nextSection);
}

function loadSection(section) {
    const _section = findSectionByHashName(section);

    if (_section !== null)
        if (_section.loadAction !== null)
            _section.loadAction();
}
