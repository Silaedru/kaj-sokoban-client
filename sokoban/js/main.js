
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

function attachListeners(target, game) {
    target.addEventListener("keyup", (e) => {
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

    target.addEventListener("keydown", (e) => {
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

function init() {
    loadResources().then(() => {
        const canvas = document.querySelector("canvas");
        const game = new Game(canvas);

        attachListeners(document, game);

        game.render();
        console.log("ready");
    });
}