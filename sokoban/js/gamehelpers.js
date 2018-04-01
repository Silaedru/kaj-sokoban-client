const GameHelpers = {
    listeners: {
        keyDown: e => GameHelpers.game.keyDownListener(e),
        keyUp: e => GameHelpers.game.keyUpListener(e),
    },

    controlsInit: false,
    gameState: -1,
    mapId: -1,
    game: null,

    clickAudio: null,
    chimeAudio: null,
    audioEnabled: null,

    registerKeyListeners: function() {
        document.addEventListener("keyup", GameHelpers.listeners.keyUp);
        document.addEventListener("keydown", GameHelpers.listeners.keyDown);
    },

    removeKeyListeners: function() {
        document.removeEventListener("keyup", GameHelpers.listeners.keyUp);
        document.removeEventListener("keydown", GameHelpers.listeners.keyDown);
    },

    playClickAudio: function() {
        try {
            if (!GameHelpers.audioEnabled.checked)
                return;

            GameHelpers.clickAudio.currentTime = 0;
            GameHelpers.clickAudio.play();
        }
        catch (e) {
            // ignore error
        }
    },

    playChimeAudio: function () {
        try {
            if (!GameHelpers.audioEnabled.checked)
                return;

            GameHelpers.chimeAudio.currentTime = 0;
            GameHelpers.chimeAudio.play();
        }
        catch (e) {
            // ignore error
        }
    },

    saveGame: function() {
        if (typeof(Storage) !== "undefined") {
            const game = GameHelpers.game;

            const saveObject = {
                map: {
                    data: game._mapData,
                    id: GameHelpers.mapId
                },
                moves: game._moves,
                states: game._states,

                playerPosition: {
                    x: game._player._x,
                    y: game._player._y,
                },

                // get indices of all crates on the map
                crates: game._map._mapObjects.reduce((accumulator, object, index) => {
                    if (object === MapObject.CRATE)
                        accumulator.push(index);
                    return accumulator;
                }, [])
            };

            localStorage.setItem("sokoban-save", JSON.stringify(saveObject));

            // display success text
            const successMessage = document.querySelector("button[data-action='save-game'] + small");
            successMessage.classList.remove("text-suppressed");

            // set timeout to remove the text from the document after a few seconds
            setTimeout(() => {
                successMessage.classList.add("text-suppressed");
            }, 2500);
        }
        else {
            showError("Cannot save the game because your browser does not support local storage");
        }
    },

    loadGame: function() {
        if (typeof(Storage) !== "undefined") {
            const save = localStorage.getItem("sokoban-save");

            if (save !== null) {
                const saveObject = JSON.parse(save);

                GameHelpers.game = null;
                GameHelpers.startGame(saveObject.map).then(game => {
                   game._moves = saveObject.moves;
                   game._states = saveObject.states;
                   game._player._x = saveObject.playerPosition.x;
                   game._player._y = saveObject.playerPosition.y;

                   // remove all crates from the loaded map
                   game._map._mapObjects = game._map._mapObjects.map(object => object === MapObject.CRATE ? MapObject.FLOOR : object);

                   // add crates to the map from their saved position
                   saveObject.crates.forEach(cratePosition => game._map._mapObjects[cratePosition] = MapObject.CRATE);

                   game.render();
                });
            }
            else {
                showError("No saved game found");
            }
        }
        else {
            showError("Cannot load the game because your browser does not support local storage");
        }
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

            document.querySelector(".game-controls-settings input[data-action='show-controls']").addEventListener("change", e => {
                if (e.target.checked)
                    document.querySelector(".game-controls").classList.remove("hidden");
                else
                    document.querySelector(".game-controls").classList.add("hidden");
            });

            document.querySelector("button[data-action='restart-game']").addEventListener("click", () => {
                /*if (showConfirm("Are you sure you want to restart current game?")) {
                    GameHelpers.game.restartGame();
                    GameHelpers.game.render();
                }*/

                showConfirm("Are you sure you want to restart current game?", () => {
                    GameHelpers.game.restartGame();
                    GameHelpers.game.render();
                });
            });
            document.querySelector("button[data-action='abandon-game']").addEventListener("click", () => {
                /*if (showConfirm("Are you sure you want to abandon current game?")) {
                    GameHelpers.game = null;
                    GameHelpers.gameState = -1;
                    GameHelpers.advanceGameState();
                }*/

                showConfirm("Are you sure you want to abandon current game?", () => {
                    GameHelpers.game = null;
                    GameHelpers.gameState = -1;
                    GameHelpers.advanceGameState();
                });
            });
            document.querySelector("button[data-action='save-game']").addEventListener("click", () => {
                GameHelpers.saveGame();
            });

            document.querySelector(".game-controls-settings input[data-action='lock-controls']").addEventListener("change", e => {
                const action = e.target.checked ? "disable" : "enable";
                $(".game-controls").draggable(action).css({cursor: e.target.checked ? "default" : "move"});
            });
            $(".game-controls").draggable().draggable("disable");

            GameHelpers.controlsInit = true;
        }
    },

    startGame: function(map) {
        return new Promise((resolve, reject) => {
            if (GameHelpers.gameState !== GameState.ACTIVE_GAME) {
                GameHelpers.advanceGameState();
                document.querySelector("#play > div[data-game-state ~= 'active-game']").style.display = "block";
                GameHelpers.registerKeyListeners();
            }

            if (GameHelpers.game === null) {
                GameHelpers.game = 0; // to make sure game is no longer "null" (avoids multiple load attempts)
                GameHelpers.mapId = map.id;

                loadResources().then(() => {
                    const canvas = document.querySelector("canvas");
                    GameHelpers.game = new Game(map.data, canvas, () => GameHelpers.advanceGameState());
                    GameHelpers.game.render();
                    //GameHelpers.initGameControls(); MOVED!!
                    resolve(GameHelpers.game);
                });
            }
        });
    },

    finishGame: function() {
        const moves = GameHelpers.game._moves;
        GameHelpers.game = null;

        //remove existing congratulation text
        const existingCongratulationText = document.querySelector("#play div[data-game-state='finished-game'] > h2");
        if (existingCongratulationText !== null)
            existingCongratulationText.parentElement.removeChild(existingCongratulationText);

        const targetParent = document.querySelector("#play div[data-game-state='finished-game']");
        const targetSibling = document.querySelector("#play div[data-game-state='finished-game'] > p");
        const victoryText = document.createElement("h2");
        victoryText.innerHTML = `Congratulations! You finished in ${moves.length} moves`;
        targetParent.insertBefore(victoryText, targetSibling);

        const onlineMapBlock = document.querySelector("div[data-game-state='finished-game'] p[data-map-type ~= 'online']");
        const offlineMapBlock = document.querySelector("div[data-game-state='finished-game'] p[data-map-type ~= 'offline']");
        const scoreboardButton = document.querySelector("div[data-game-state='finished-game'] button[data-action = 'advance-game-state']");

        // online map
        if (GameHelpers.mapId > 0) {
            onlineMapBlock.style.display = "block";
            offlineMapBlock.style.display = "none";
            scoreboardButton.style.display = "";

            const nameInput = document.querySelector("div[data-game-state='finished-game'] input[type='text']");
            const submitButton = document.querySelector("div[data-game-state='finished-game'] button[data-action='submit-score']");

            // delete text with information about player's position if it exists
            const positionInfoElement = document.querySelector("div[data-game-state='score-table'] > p");
            if (positionInfoElement !== null)
                positionInfoElement.parentElement.removeChild(positionInfoElement);

            // reset name input
            nameInput.value = "";

            // trick to get rid of the anonymous listener (if there is one)
            const newSubmitButton = submitButton.cloneNode(true);
            submitButton.parentElement.replaceChild(newSubmitButton, submitButton);

            newSubmitButton.addEventListener("click", () => {
                const name = nameInput.value.trim();

                if (name.length > 2) {
                    //alert(moves.length);
                    ajaxRequest("POST", Server.address + Server.scorePath, JSON.stringify({
                       mapId: GameHelpers.mapId,
                       name: name,
                       moves: moves.length
                    })).then(response => {
                        const newPositionInfoElement = document.createElement("p");
                        newPositionInfoElement.innerHTML = `You placed at position ${response} with your score of ${moves.length} moves.`;
                        const targetSibling = document.querySelector("div[data-game-state='score-table'] > h2");
                        targetSibling.parentElement.insertBefore(newPositionInfoElement, targetSibling);
                        GameHelpers.advanceGameState();
                    }).catch(error => {
                        showError("Error occurred while submitting your score, please retry.");
                    });
                }
                else {
                    showError("Please enter at least 3 visible characters as your nickname");
                }
            });
        }
        else {
            onlineMapBlock.style.display = "none";
            offlineMapBlock.style.display = "block";
            scoreboardButton.style.display = "none";
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
                GameHelpers.finishGame();
                break;

            case GameState.SCORE_TABLE:
                document.querySelector("#play > div[data-game-state ~= 'score-table']").style.display = "block";

                const tableBody = document.querySelector("#play > div[data-game-state ~= 'score-table'] table > tbody");
                tableBody.innerHTML = "";

                ajaxRequest("GET", Server.address + Server.scorePath + "/" + GameHelpers.mapId + "/10").then(response => {
                    const scoreEntries = JSON.parse(response);

                    // just to make sure the scores are sorted properly
                    scoreEntries.sort((a, b) => a.position - b.position);

                    scoreEntries.forEach(scoreEntry => {
                        tableBody.innerHTML += `<tr><td>${scoreEntry.position}</td><td>${scoreEntry.name}</td><td>${scoreEntry.moves}</td></tr>`;
                    });
                }).catch(error => showNotification("Failed to retrieve scoreboard from the server"));

                break;
        }
    },
};

