
const sections = [
    {name: "#home", loadAction: null, unloadAction: null},
    {name: "#play", loadAction: loadGame, unloadAction: pauseGame},
    {name: "#about", loadAction: null, unloadAction: null}
];

const tempMapData = "{\n" +
    " \"width\":20,\n" +
    " \"height\":12,\n" +
    "\n" +
    " \"walls\":[8,9,10,11,12,64],\n" +
    " \"crates\":[45, 48],\n" +
    " \"targets\":[37],\n" +
    " \"player\":24\n" +
    "}";

let game = null;
let controlsInit = false;

function loadGame() {
    if (game === null) {
        game = 0; // to make sure game is no longer "null"

        loadResources().then(() => {
            const canvas = document.querySelector("canvas");
            game = new Game(tempMapData, canvas);

            document.addEventListener("keyup", game.keyUpListener);
            document.addEventListener("keydown", game.keyDownListener);

            game.render();

            initGameControls();
        });
    }
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
            const visible = e.target.checked;

            if (visible)
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
    const rtn = sections.filter(section => section.name === sectionHashName);

    if (rtn.length === 1)
        return rtn[0];

    return sections[0];
}

function redirectToPageSection(section) {
    let currentSection = sections[0];

    if (sections.map(section => section.name).includes(document.location.hash))
        currentSection = document.location.hash;

    // perform current section unloading
    const currentSectionObject = findSectionByHashName(currentSection);
    if (currentSectionObject.unloadAction != null)
        currentSectionObject.unloadAction();

    // change the section
    document.location.hash = section;
    loadSection();
}

function loadSection() {
    let sectionName = sections[0].name;

    if (sections.map(section => section.name).includes(document.location.hash))
        sectionName = document.location.hash;

    // hide all page parts
    sections.forEach(section => {
       document.querySelector(section.name + "Section").style.display = "none";
    });

    // make the selected part visible
    document.querySelector(sectionName + "Section").style.display = "block";

    const sectionObject = findSectionByHashName(sectionName);
    if (sectionObject.loadAction != null)
        sectionObject.loadAction();
}
