/**
 * Key codes for keyboard events
 */
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

/**
 * Game server constants
 */
const Server = {
    address: "http://dixneuf.nevesnican.cz:10500",
    mapsPath: "/maps",
    scorePath: "/scores",
};

/**
 * Schema for creating svg elements
 */
const w3svg = "http://www.w3.org/2000/svg";

/**
 * Promise wrapper around XMLHttpRequest with 5000ms timeout
 * @param method {string} HTTP method
 * @param target {string} target address
 * @param payload {*} request data
 * @returns {Promise} promise that gets resolved when the request is completed successfully or rejected when the
 * request fails or times out
 */
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

        // timer for request timeout
        timeout = setTimeout(() => {
            reject("request timed out");
        }, 5000);

        request.open(method, target);
        request.send(payload);
    });
}

/**
 * Creates a svg rectangle
 * @param x {string} x attribute
 * @param y {string} y attribute
 * @param width {string} width attribute
 * @param height {string} height attribute
 * @param fill {string} fill attribute
 * @returns {SVGAElement}
 */
function createSvgRect(x, y, width, height, fill) {
    const rect = document.createElementNS(w3svg, "rect");

    rect.setAttributeNS(null, "x", x);
    rect.setAttributeNS(null, "y", y );
    rect.setAttributeNS(null, "height", width);
    rect.setAttributeNS(null, "width", height);
    rect.setAttributeNS(null, "fill", fill);

    return rect;
}

/**
 * Replaces sensitive special characters with HTML entities
 * @param string {string} string to be escaped
 * @returns {string} escaped string
 */
function escapeHTML(string) {
    return String(string).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Shows a modal overlay on the page with a single confirm button and specified message
 * @param message {string} message to be shown
 */
function showError(message) {
    document.querySelector("div[data-modal-type='overlay']").style.display = "none"; // override overlay hiding
    document.querySelector("div[data-modal-type='error'] .modal-content > div").innerText = message;
    document.querySelector("div[data-modal-type='error']").style.display = "flex";
}

/**
 * After 100ms shows a modal overlay on the page without any elements for user interaction
 * @param message {string} message to be shown
 * @param showLoader {boolean} true by default; if true, loading wheel will be shown
 * @returns {number} returns timeout identifier for hideOverlay
 */
function showOverlay(message, showLoader = true) {
    // to avoid flashing that happens show and hide overlay are called in short span of time, this function waits 100ms
    // before actually showing the overlay
    return setTimeout(() => {
        document.querySelector("div[data-modal-type='overlay'] .loader").style.display = showLoader ? "block" : "none";
        document.querySelector("div[data-modal-type='overlay'] .progress").innerText = "";
        document.querySelector("div[data-modal-type='overlay'] .modal-content > div").innerText = message;
        document.querySelector("div[data-modal-type='overlay']").style.display = "flex";
    }, 100);
}

/**
 * Hides overlay created by showOverlay
 * @param overlayTimeout {number} timeout identifier returned by showOverlay function
 */
function hideOverlay(overlayTimeout) {
    clearTimeout(overlayTimeout); // clear timeout by showOverlay in case it's still set

    // before hiding the overlay wait 600ms (this does nothing if 100ms hasn't passed since showOverlay was called) to
    // avoid unwanted quick flash of the overlay
    setTimeout(() => document.querySelector("div[data-modal-type='overlay']").style.display = "none", 600);
}

/**
 * Shows a modal overlay with "yes" and "no" buttons
 * @param message {string} message to be shown
 * @param confirmedCallback {function|undefined} function to be called when the "yes" button is clicked
 * @param cancelledCallback {function|undefined} function to be called when the "no" button is clicked
 */
function showConfirm(message, confirmedCallback = undefined, cancelledCallback = undefined) {
    document.querySelector("div[data-modal-type='confirm'] .modal-content > div").innerText = message;
    document.querySelector("div[data-modal-type='confirm']").style.display = "flex";

    // clear the buttons of existing listeners
    const yesButton = document.querySelector("div[data-modal-type='confirm'] .modal-content button[data-action='yes']");
    const clonedYesButton = yesButton.cloneNode(true);
    yesButton.parentElement.replaceChild(clonedYesButton, yesButton);

    const noButton = document.querySelector("div[data-modal-type='confirm'] .modal-content button[data-action='no']");
    const clonedNoButton = noButton.cloneNode(true);
    noButton.parentElement.replaceChild(clonedNoButton, noButton);

    // add callbacks as listeners to the "new" buttons
    clonedYesButton.addEventListener("click", () => {
        document.querySelector("div[data-modal-type='confirm']").style.display = "none"; // hide the modal overlay
        if (confirmedCallback) // call the callback
            confirmedCallback();
    });
    clonedNoButton.addEventListener("click", () => {
        document.querySelector("div[data-modal-type='confirm']").style.display = "none"; // hide the modal overlay
        if (cancelledCallback) // call the callback
            cancelledCallback();
    });
}

/**
 * Shows a notification strip on the page for 7500ms with provided message
 * @param message {string} message to be shown
 */
function showNotification(message) {
    document.querySelector("div[data-modal-type='overlay']").style.display = "none"; // hide the notification overlay
    const notificationElement = document.querySelector("div.notification");
    notificationElement.innerText = message;
    notificationElement.classList.add("notification-visible");

    // automatically remove the notification from the page
    setTimeout(() => {
        notificationElement.classList.remove("notification-visible");
    }, 7500);
}