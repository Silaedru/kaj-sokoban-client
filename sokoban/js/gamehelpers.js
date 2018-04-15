/**
 * Contains helper functions for the game interactions
 */
const GameHelpers = {
    /**
     * named listeners used by the Game
     */
    listeners: {
        keyDown: e => GameHelpers.game.keyDownListener(e), // key down event listener
        keyUp: e => GameHelpers.game.keyUpListener(e), // key up event listener
    },

    controlsInit: false, // true if the game controls were initialized
    gameState: -1, // current game state, initially set to -1 as no state is initialized at start
    mapId: -1, // database id of the current map
    game: null, // instance of the game object for current active game

    clickAudio: null, // HTMLAudioElement for the audio element with the "click" noise
    chimeAudio: null, // HTMLAudioElement for the audio element with the "chime" noise
    audioEnabledElement: null, // HTMLInputElement for the checkbox which is used to toggle audio on or off

    /**
     * Registers listeners for keyboard events
     */
    registerKeyListeners: function() {
        document.addEventListener("keyup", GameHelpers.listeners.keyUp);
        document.addEventListener("keydown", GameHelpers.listeners.keyDown);
    },

    /**
     * Unregisters listeners for keyboard events
     */
    removeKeyListeners: function() {
        document.removeEventListener("keyup", GameHelpers.listeners.keyUp);
        document.removeEventListener("keydown", GameHelpers.listeners.keyDown);
    },

    /**
     * Plays the "click" audio if the audio is enabled
     */
    playClickAudio: function() {
        try {
            if (!GameHelpers.audioEnabledElement.checked)
                return;

            GameHelpers.clickAudio.currentTime = 0;
            GameHelpers.clickAudio.play();
        }
        catch (e) {
            // ignore error
        }
    },

    /**
     * Plays the "chime" audio if the audio is enabled
     */
    playChimeAudio: function () {
        try {
            if (!GameHelpers.audioEnabledElement.checked)
                return;

            GameHelpers.chimeAudio.currentTime = 0;
            GameHelpers.chimeAudio.play();
        }
        catch (e) {
            // ignore error
        }
    },

    /**
     * Saves the current game to local storage
     */
    saveGame: function() {
        // verify that localStorage is supported
        if (typeof(Storage) !== "undefined") {
            const game = GameHelpers.game; // saves some writing since the game object is used a lot in this function

            /**
             * The object containing all the important game data
             * @name SaveObject
             */
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

            // this process can take a while - lock out the player by showing an overlay and removing keyboard event listeners
            const overlay = showOverlay("Saving, please wait...", false);
            GameHelpers.removeKeyListeners();

            // compress the stringified SaveObject before saving it to local storage
            LZMA.compress(JSON.stringify(saveObject), 2, (result, error) => {
                localStorage.setItem("sokoban-save", JSON.stringify(result)); // save the result to local storage (it needs to be stringified since it's an array of integers that represent the compressed data)

                // restore player's access to the game
                hideOverlay(overlay);
                GameHelpers.registerKeyListeners();

                // display success text
                const successMessage = document.querySelector("button[data-action='save-game'] + small");
                successMessage.classList.remove("text-suppressed");

                // set timeout to remove the success text from the document after a while
                setTimeout(() => {
                    successMessage.classList.add("text-suppressed");
                }, 4000);
            }, progress => {
                // display progress
                document.querySelector("div[data-modal-type='overlay'] .progress").innerText = Math.round(progress*100);
            });
        }
        else {
            showError("Cannot save the game because your browser does not support local storage");
        }
    },

    /**
     * Loads game from local storage
     */
    loadGame: function() {
        // verify that localStorage is supported
        if (typeof(Storage) !== "undefined") {
            const save = localStorage.getItem("sokoban-save"); // get the save data from localStorage

            if (save !== null) {
                // if there were any save data
                const overlay = showOverlay("Loading game, please wait...");
                try {
                    LZMA.decompress(JSON.parse(save), (result, error) => {
                        try {
                            if (error !== undefined) {
                                throw new Error(error);
                            }

                            const saveObject = JSON.parse(result);

                            // start the game with the loaded data
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

                            hideOverlay(overlay);
                        } catch (e) {
                            hideOverlay(overlay);
                            showError("Failed to load saved game");
                        }
                    });
                } catch(e) {
                    hideOverlay(overlay);
                    showError("Failed to load saved game");
                }
            }
            else {
                // no save data found
                showError("No saved game found");
            }
        }
        else {
            showError("Cannot load the game because your browser does not support local storage");
        }
    },

    /**
     * Initializes the game controls (makes buttons in the play section, "active game" screen, usable)
     */
    initGameControls: function() {
        // don't do anything if the controls were already initialized
        if (GameHelpers.controlsInit)
            return;

        // buttons for controlling player movement
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

        // "show controls" checkbox
        document.querySelector(".game-controls-settings input[data-action='show-controls']").addEventListener("change", e => {
            if (e.target.checked)
                document.querySelector(".game-controls").classList.remove("hidden");
            else
                document.querySelector(".game-controls").classList.add("hidden");
        });

        // "restart game" button
        document.querySelector("button[data-action='restart-game']").addEventListener("click", () => {
            showConfirm("Are you sure you want to restart current game?", () => {
                GameHelpers.game.restartGame();
                GameHelpers.game.render();
            });
        });

        // "abandon game" button
        document.querySelector("button[data-action='abandon-game']").addEventListener("click", () => {
            showConfirm("Are you sure you want to abandon current game?", () => {
                GameHelpers.game = null;
                GameHelpers.gameState = -1;
                GameHelpers.advanceGameState();
            });
        });

        // "save game" button
        document.querySelector("button[data-action='save-game']").addEventListener("click", () => {
            GameHelpers.saveGame();
        });

        // "lock controls movement" checkbox - following 5 lines are the only jQuery/jQueryUI dependency in this entire project
        document.querySelector(".game-controls-settings input[data-action='lock-controls']").addEventListener("change", e => {
            const action = e.target.checked ? "disable" : "enable";
            $(".game-controls").draggable(action).css({cursor: e.target.checked ? "default" : "move"});
        });
        $(".game-controls").draggable().draggable("disable");

        // game controls were initialized
        GameHelpers.controlsInit = true;
    },

    /**
     * Starts the game (moves from map select screen to active game screen)
     * @param map {Object} map object ( format: {id: mapId (integer), data: mapData (json map data)} ) with the map data
     * @returns {Promise} promise that is resolved when the game has been started
     */
    startGame: function(map) {
        return new Promise((resolve, reject) => {
            // show "active game" screen
            if (GameHelpers.gameState !== GameState.ACTIVE_GAME) {
                GameHelpers.advanceGameState();
                document.querySelector("#play > div[data-game-state ~= 'active-game']").style.display = "block";
                GameHelpers.registerKeyListeners();
            }

            // init the game instance
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

    /**
     * Performs "map completed" logic - moves to "achieved score" screen, fills in score values on the page
     */
    finishGame: function() {
        const moves = GameHelpers.game._moves; // moves that were performed to complete the map
        GameHelpers.game = null; // reset the game instance back to null

        // remove existing congratulation text
        const existingCongratulationText = document.querySelector("#play div[data-game-state='finished-game'] > h2");
        if (existingCongratulationText !== null)
            existingCongratulationText.parentElement.removeChild(existingCongratulationText);

        // add updated congratulations text
        const targetParent = document.querySelector("#play div[data-game-state='finished-game']");
        const targetSibling = document.querySelector("#play div[data-game-state='finished-game'] > p");
        const victoryText = document.createElement("h2");
        victoryText.innerHTML = `Congratulations! You finished in ${moves.length} moves`;
        targetParent.insertBefore(victoryText, targetSibling);

        const onlineMapBlock = document.querySelector("div[data-game-state='finished-game'] p[data-map-type ~= 'online']");
        const offlineMapBlock = document.querySelector("div[data-game-state='finished-game'] p[data-map-type ~= 'offline']");
        const scoreboardButton = document.querySelector("div[data-game-state='finished-game'] button[data-action = 'advance-game-state']");

        if (GameHelpers.mapId > 0) {
            // online map (loaded from server) - score can be submitted to the server
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

            // function for sending the score to the server
            const submitScore = () => {
                const name = nameInput.value.trim(); // player name

                // name must contain at least 3 letters (arbitrary limit)
                if (name.length > 2) {
                    // to prevent multiple send attempts, remove the function as a click listener from the submit button
                    newSubmitButton.removeEventListener("click", submitScore);
                    const overlay = showOverlay("Submitting your score, please wait...");

                    ajaxRequest("POST", Server.address + Server.scorePath, JSON.stringify({
                        mapId: GameHelpers.mapId,
                        name: name,
                        moves: moves.length
                    })).then(response => {
                        hideOverlay(overlay);

                        // server response contains the position that player's score achieved - display it above the scoreboard
                        // in the next screen
                        const newPositionInfoElement = document.createElement("p");
                        newPositionInfoElement.innerHTML = `You placed at position ${response} with your score of ${moves.length} moves.`;
                        const targetSibling = document.querySelector("div[data-game-state='score-table'] > h2");
                        targetSibling.parentElement.insertBefore(newPositionInfoElement, targetSibling);

                        // move to the scoretable screen
                        GameHelpers.advanceGameState();
                    }).catch(error => {
                        //error occurred during the request - score wasn't submitted
                        hideOverlay(overlay);
                        showError("Error occurred while submitting your score, please retry.");
                        newSubmitButton.addEventListener("click", submitScore);
                    });
                }
                else {
                    showError("Please enter at least 3 visible characters as your nickname");
                }
            };

            // add the submitScore function as a click listener to the "Submit Score" button
            newSubmitButton.addEventListener("click", submitScore);
        }
        else {
            // offline map (loaded from local file) - score can't be submitted
            onlineMapBlock.style.display = "none";
            offlineMapBlock.style.display = "block";
            scoreboardButton.style.display = "none";
        }
    },

    /**
     * Moves to the next game screen
     */
    advanceGameState: function() {
        // to assure cyclical movement between the screens (advance from the last screen results in the first screen)
        GameHelpers.gameState = (GameHelpers.gameState + 1) % Object.keys(GameState).length;

        // hide all the screens
        document.querySelectorAll("#play > div").forEach(element => element.style.display = "none");

        // show screen based on current gameState
        switch (GameHelpers.gameState) {
            case GameState.MAP_SELECT:
                GameHelpers.removeKeyListeners();
                document.querySelector("#play > div[data-game-state ~= 'map-select']").style.display = "block";
                MapUtils.loadMaps();
                break;

            case GameState.ACTIVE_GAME:
                // this screen has custom logic (startGame() function)
                break;

            case GameState.FINISHED_GAME:
                GameHelpers.removeKeyListeners();
                document.querySelector("#play > div[data-game-state ~= 'finished-game']").style.display = "block";
                GameHelpers.finishGame();
                break;

            case GameState.SCORE_TABLE:
                document.querySelector("#play > div[data-game-state ~= 'score-table']").style.display = "block";

                // reset scoretable content
                const tableBody = document.querySelector("#play > div[data-game-state ~= 'score-table'] table > tbody");
                tableBody.innerHTML = "";
                const overlay = showOverlay("Loading scoreboard, please wait...");

                // load the scoretable
                ajaxRequest("GET", Server.address + Server.scorePath + "/" + GameHelpers.mapId + "/10").then(response => {
                    hideOverlay(overlay);
                    const scoreEntries = JSON.parse(response);

                    // just to make sure the scores are sorted properly
                    scoreEntries.sort((a, b) => a.position - b.position);

                    scoreEntries.forEach(scoreEntry => {
                        tableBody.innerHTML += `<tr><td>${scoreEntry.position}</td><td>${scoreEntry.name}</td><td>${scoreEntry.moves}</td></tr>`;
                    });
                }).catch(error => {
                    hideOverlay(overlay);
                    showNotification("Failed to retrieve scoreboard from the server");
                });

                break;
        }
    },
};
