
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

function loadGame() {
    if (game === null) {
        game = 0; // to make sure game is no longer "null"

        loadResources().then(() => {
            const canvas = document.querySelector("canvas");
            game = new Game(tempMapData, canvas);

            document.addEventListener("keyup", game.keyUpListener);
            document.addEventListener("keydown", game.keyDownListener);

            game.render();
        });
    }
}

function pauseGame() {
    if (game instanceof Game) {
        document.removeEventListener("keyup", game.keyUpListener);
        document.removeEventListener("keydown", game.keyDownListener);
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
