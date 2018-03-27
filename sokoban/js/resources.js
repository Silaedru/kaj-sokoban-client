
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

function loadResources() {
    let resourcesToLoad = 0;
    let resourcesLoaded = 0;

    Object.keys(Resources).forEach(type => {
        Object.keys(Resources[type]).forEach(resource => {
            // only load the resource if it hasn't been loaded yet
            if (Resources[type][resource].resource === null) {
                resourcesToLoad++;
                const resourceData = new Image();
                resourceData.onload = () => {
                    Resources[type][resource].resource = resourceData;
                    resourcesLoaded++;
                };
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
