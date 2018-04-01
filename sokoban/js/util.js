
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

        request.timeout = 10000;
        request.addEventListener("load", response => resolve(response.target.responseText));
        request.addEventListener("error", error => reject(error.target));

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
    alert(message);
}

function showConfirm(message) {
    return confirm(message);
}

function showNotification(message) {
    const notificationElement = document.querySelector("div.notification");
    notificationElement.innerText = message;
    notificationElement.classList.add("notification-visible");

    setTimeout(() => {
        notificationElement.classList.remove("notification-visible");
    }, 5000);
}