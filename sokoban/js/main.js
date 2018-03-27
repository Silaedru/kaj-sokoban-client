
const KeyCode = {
    KEY_LEFT: 37,
    KEY_RIGHT: 39,
    KEY_UP: 38,
    KEY_DOWN: 40,

    KEY_A: 65,
    KEY_D: 68,
    KEY_W: 87,
    KEY_S: 83,

    KEY_BACKSPACE: 8,
};

const sections = [
  "#home",
  "#play",
  "#about"
];

function attachListeners(game) {
    document.addEventListener("keyup", (e) => {
       switch (e.keyCode) {
           case KeyCode.KEY_LEFT:
           case KeyCode.KEY_A:
               game.move(Direction.LEFT);
               break;

           case KeyCode.KEY_RIGHT:
           case KeyCode.KEY_D:
               game.move(Direction.RIGHT);
               break;

           case KeyCode.KEY_DOWN:
           case KeyCode.KEY_S:
               game.move(Direction.DOWN);
               break;

           case KeyCode.KEY_UP:
           case KeyCode.KEY_W:
               game.move(Direction.UP);
               break;

           case KeyCode.KEY_BACKSPACE:
               game.undoMove();
               break;

           default:
               return;
       }

       e.preventDefault();
    });

    document.addEventListener("keydown", (e) => {
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
    });
}

function redirectToPageLocation(section) {
    document.location.hash = section;
    loadPage();
}

function initGame() {
    loadResources().then(() => {
        const canvas = document.querySelector("canvas");
        const game = new Game(canvas);

        attachListeners(game);

        game.render();
        console.log("ready");
    });
}

function loadPage() {
    let section = sections[0];

    if (sections.includes(document.location.hash))
        section = document.location.hash;

    // hide all page parts
    sections.forEach(section => {
       document.querySelector(section + "Section").style.display = "none";
    });

    // make the selected part visible
    document.querySelector(section+ "Section").style.display = "block";
}

