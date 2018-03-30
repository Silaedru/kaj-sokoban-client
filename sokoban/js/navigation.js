
const SectionActions = [
    {
        name: "play",
        loadAction: () => {
            if (GameHelpers.gameState < 0) {
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
                            alert("ERR_READING_FILE");
                        }
                    };

                    reader.readAsText(file);
                });

                //temp reset button
                document.querySelector("button[data-action='return-to-map-select']").addEventListener("click", () => GameHelpers.advanceGameState());
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
