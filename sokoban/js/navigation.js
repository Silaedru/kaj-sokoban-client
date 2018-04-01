
const SectionActions = [
    {name: "home", loadAction: null, unloadAction: null},
    {name: "about", loadAction: null, unloadAction: null},
    {
        name: "play",
        loadAction: () => {
            if (GameHelpers.gameState < 0) {
                GameHelpers.clickAudio = document.querySelector("audio[data-name='click']");
                GameHelpers.chimeAudio = document.querySelector("audio[data-name='chime']");
                GameHelpers.audioEnabled = document.querySelector(".game-controls-settings input[data-action='play-sounds']");

                GameHelpers.advanceGameState();

                document.querySelector("#map-file-picker").addEventListener("change", e => {
                    const file = e.target.files[0];

                    if (!file)
                        return;

                    const reader = new FileReader();

                    reader.onload = e => {
                        const fileContent = e.target.result;

                        try {
                            const mapData = JSON.parse(fileContent);
                            GameHelpers.startGame({id: -1, data: mapData});
                        }
                        catch (e) {
                            showError("Error occurred while reading the file");
                        }
                    };

                    reader.readAsText(file);
                });

                // load game button
                document.querySelector("button[data-action='load-game']").addEventListener("click", () => GameHelpers.loadGame());

                document.querySelector("button[data-action='return-to-map-select']").addEventListener("click", () => {
                    GameHelpers.game = null;
                    GameHelpers.gameState = -1;
                    GameHelpers.advanceGameState();
                });

                //
                document.querySelectorAll("button[data-action='advance-game-state']").forEach(element => element.addEventListener("click", () => GameHelpers.advanceGameState()));
                GameHelpers.initGameControls();
            }

            if (GameHelpers.gameState === GameState.ACTIVE_GAME)
                GameHelpers.registerKeyListeners();
        },
        unloadAction: GameHelpers.removeKeyListeners
    }
];

function findSectionByHashName(sectionHashName) {
    const rtn = SectionActions.filter(section => section.name === sectionHashName);

    if (rtn.length === 1)
        return rtn[0];

    return null;
}

function unloadSection(section, nextSection) {
    const _section = findSectionByHashName(section);

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
