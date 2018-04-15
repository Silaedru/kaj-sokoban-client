/**
 * Sections of the site - this object contains an array of all existing sections; each element must contain a name property,
 * which must be the same as the id of corresponding <section> on the page and load and unload action, which
 * are functions that are called when the section is loaded or unloaded respectively - these can be null
 */
const Sections = [
    {name: "home", loadAction: null, unloadAction: null},
    {name: "about", loadAction: null, unloadAction: null},
    {
        name: "play",
        loadAction: () => {
            // when a play section is first accessed, some initialization needs to be done,
            if (GameHelpers.gameState < 0) {
                // set the audio elements
                GameHelpers.clickAudio = document.querySelector("audio[data-name='click']");
                GameHelpers.chimeAudio = document.querySelector("audio[data-name='chime']");
                GameHelpers.audioEnabledElement = document.querySelector(".game-controls-settings input[data-action='play-sounds']");

                // set the game state to its proper initial value
                GameHelpers.advanceGameState();

                // handler for the loading map from file (it's actually a file input)
                document.querySelector("#map-file-picker").addEventListener("change", e => {
                    const file = e.target.files[0]; // selected file

                    // no file was selected
                    if (!file)
                        return;

                    const reader = new FileReader();

                    // load event listener
                    reader.addEventListener("load", e => {
                        const fileContent = e.target.result;

                        try {
                            // try to parse the map data and verify that it's a valid map
                            const mapData = JSON.parse(fileContent);
                            if (!MapUtils.verifyMap(mapData))
                                throw new Error("invalid map"); // since it's a form of error it's easier to just throw an exception that will be caught immediately

                            // load the map
                            GameHelpers.startGame({id: -1, data: mapData});
                        }
                        catch (e) {
                            showError("Cannot load a map from the provided file");
                        }
                    });

                    // read the file
                    reader.readAsText(file);
                });

                // buttons for controlling the game
                // "load game" button
                document.querySelector("button[data-action='load-game']").addEventListener("click", () => GameHelpers.loadGame());

                // "return to map select" button
                document.querySelector("button[data-action='return-to-map-select']").addEventListener("click", () => {
                    // return to map select - reset the game variables
                    GameHelpers.game = null;
                    GameHelpers.mapId = -1;
                    GameHelpers.gameState = -1; // so the next advanceGameState advances the gameState to MapSelect
                    GameHelpers.advanceGameState(); // actually return to map select
                });

                // buttons that allow skipping of a game state
                document.querySelectorAll("button[data-action='advance-game-state']").forEach(element => element.addEventListener("click", () => GameHelpers.advanceGameState()));

                // initialize the game controls
                GameHelpers.initGameControls();
            } // end of the initialization logic, rest of this function will be performed on every load of the play section

            // if the game is active, register the key event listeners
            if (GameHelpers.gameState === GameState.ACTIVE_GAME)
                GameHelpers.registerKeyListeners();
        },
        unloadAction: GameHelpers.removeKeyListeners // on unload of the play section, remove the key event listeners
    }
];

/**
 * Finds a section in the {Section} object
 * @param sectionHashName {string} searched section name
 * @returns {*} concrete section object of the target section or null if no such section exists
 */
function findSectionByHashName(sectionHashName) {
    const rtn = Sections.filter(section => section.name === sectionHashName);

    if (rtn.length === 1)
        return rtn[0];

    return null;
}

/**
 * Unloads a page section and loads next section
 * @param section {string} name of the section to be unloaded
 * @param nextSection {string} name of the next section to be loaded
 */
function unloadSection(section, nextSection) {
    const _section = findSectionByHashName(section);

    if (_section !== null)
        if (_section.unloadAction !== null)
            _section.unloadAction();

    loadSection(nextSection);
}

/**
 * Loads a page section
 * @param section {string} name of the section to be loaded
 */
function loadSection(section) {
    const _section = findSectionByHashName(section);

    if (_section !== null)
        if (_section.loadAction !== null)
            _section.loadAction();
}
