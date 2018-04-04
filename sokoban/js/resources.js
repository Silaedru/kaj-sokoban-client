/**
 * Dynamically loaded resources used by the game
 */
const Resources = {
    Map: {
        wall: {resource: null, path: "media/graphics/wall.svg"},
        crate: {resource: null, path: "media/graphics/crate.svg"},
        target: {resource: null, path: "media/graphics/target_cyan.svg"},
        floor: {resource: null, path: "media/graphics/floor.svg"}
    },

    Player: {
        left: {resource: null, path: "media/graphics/player_left.svg"},
        right: {resource: null, path: "media/graphics/player_right.svg"},
        up: {resource: null, path: "media/graphics/player_up.svg"},
        down: {resource: null, path: "media/graphics/player_down.svg"}
    }
};

/**
 * Loads the game resources
 * @returns {Promise} promise that is resolved when the game resources are loaded
 */
function loadResources() {
    // for keeping track of the loading state
    let resourcesToLoad = 0;
    let resourcesLoaded = 0;

    // for each resource "namespace"
    Object.keys(Resources).forEach(type => {
        // for each individual resource
        Object.keys(Resources[type]).forEach(resource => {
            // only load the resource if it hasn't been loaded yet
            if (Resources[type][resource].resource === null) {
                resourcesToLoad++;
                const resourceData = new Image();

                // load listener - gets called when the individual resource is loaded
                resourceData.addEventListener("load", () => {
                    Resources[type][resource].resource = resourceData; // set the data
                    resourcesLoaded++;
                });

                resourceData.src = Resources[type][resource].path;
            }
        });
    });

    return new Promise((resolve, reject) => {
       const loadChecker = () => {
           if (resourcesToLoad === resourcesLoaded)
               resolve();
           else
               setTimeout(loadChecker, 100);
       };

       loadChecker();
    });
}
