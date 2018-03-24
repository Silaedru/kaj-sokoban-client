
const KeyCode = {
    KEY_LEFT: 37,
    KEY_RIGHT: 39,
    KEY_UP: 38,
    KEY_DOWN: 40,

    KEY_A: 65,
    KEY_D: 68,
    KEY_W: 87,
    KEY_S: 83,
};

function attachListeners(target, game) {
    target.addEventListener("keyup", (e) => {
        e.preventDefault();

       switch (e.keyCode) {
           case KeyCode.KEY_LEFT:
           case KeyCode.KEY_A:
               game.moveLeft();
               break;

           case KeyCode.KEY_RIGHT:
           case KeyCode.KEY_D:
               game.moveRight();
               break;

           case KeyCode.KEY_DOWN:
           case KeyCode.KEY_S:
               game.moveDown();
               break;

           case KeyCode.KEY_UP:
           case KeyCode.KEY_W:
               game.moveUp();
               break;
       }
    });

    target.addEventListener("keydown", (e) => {
        e.preventDefault();
    });
}

function init() {
    loadResources().then(() => {
        const canvas = document.querySelector("canvas");
        const game = new Game(canvas);

        attachListeners(document, game);

        window.requestAnimationFrame(() => game.render());
        console.log("ready");
    });
}