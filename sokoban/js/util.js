
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

const Server = {
    address: "http://dixneuf.nevesnican.cz:10500",
    mapsPath: "/map",
    scorePath: "/score",
};

const w3svg = "http://www.w3.org/2000/svg";

function ajaxRequest(method, target, payload = undefined) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        let timeout;

        request.timeout = 5000;
        request.addEventListener("load", response => {
            clearTimeout(timeout);
            resolve(response.target.responseText);
        });
        request.addEventListener("error", error => {
            clearTimeout(timeout);
            reject(error.target);
        });

        timeout = setTimeout(() => {
            reject("request timed out");
        }, 5000);

        request.open(method, target);
        request.send(payload);
    });
}

function createSvgRect(x, y, width, height, fill) {
    const rect = document.createElementNS(w3svg, "rect");

    rect.setAttributeNS(null, "x", x);
    rect.setAttributeNS(null, "y", y );
    rect.setAttributeNS(null, "height", width);
    rect.setAttributeNS(null, "width", height);
    rect.setAttributeNS(null, "fill", fill);

    return rect;
}

function showError(message) {
    document.querySelector("div[data-modal-type='error'] .modal-content > div").innerText = message;
    document.querySelector("div[data-modal-type='error']").style.display = "flex";
}

function showOverlay(message) {
    return setTimeout( () => {
        document.querySelector("div[data-modal-type='overlay'] .modal-content > div").innerText = message;
        document.querySelector("div[data-modal-type='overlay']").style.display = "flex";
    }, 100);
}

function hideOverlay(timeout) {
    clearTimeout(timeout);
    document.querySelector("div[data-modal-type='overlay']").style.display = "none";
}

function showConfirm(message, confirmedCallback = undefined, cancelledCallback = undefined) {
    document.querySelector("div[data-modal-type='confirm'] .modal-content > div").innerText = message;
    document.querySelector("div[data-modal-type='confirm']").style.display = "flex";

    // hax to clear the buttons of existing listeners
    const yesButton = document.querySelector("div[data-modal-type='confirm'] .modal-content button[data-action='yes']");
    const clonedYesButton = yesButton.cloneNode(true);
    yesButton.parentElement.replaceChild(clonedYesButton, yesButton);
    const noButton = document.querySelector("div[data-modal-type='confirm'] .modal-content button[data-action='no']");
    const clonedNoButton = noButton.cloneNode(true);
    noButton.parentElement.replaceChild(clonedNoButton, noButton);

    // add callbacks as listeners to "new" buttons
    clonedYesButton.addEventListener("click", () => {
        document.querySelector("div[data-modal-type='confirm']").style.display = "none";

        if (confirmedCallback)
            confirmedCallback();
    });

    clonedNoButton.addEventListener("click", () => {
        document.querySelector("div[data-modal-type='confirm']").style.display = "none";

        if (cancelledCallback)
            cancelledCallback();
    });
}

function showNotification(message) {
    const notificationElement = document.querySelector("div.notification");
    notificationElement.innerText = message;
    notificationElement.classList.add("notification-visible");

    setTimeout(() => {
        notificationElement.classList.remove("notification-visible");
    }, 7500);
}