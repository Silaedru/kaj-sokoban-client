
function ajaxRequest(method, target) {
    return new Promise((resolve, reject) => {
       const request = new XMLHttpRequest();

       request.timeout = 10000;
       request.addEventListener("load", response => resolve(response.target.responseText));
       request.addEventListener("error", error => reject(error.target));

       request.open(method, target);
       request.send();
    });
}
