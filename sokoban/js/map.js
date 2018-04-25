/**
 * Objects that the map may contain
 * @type {{FLOOR: number, WALL: number, CRATE: number, TARGET: number, PLAYER: number}}
 */
const MapObject = {
    FLOOR: 0,
    WALL: 1,
    CRATE: 2,
    TARGET: 3,
    PLAYER: 4
};

/**
 * Colors representing respective MapObjects
 * @type {string[]}
 */
const MapObjectColor = ["#ffffff", "#000000", "#9C927A", "#00aecd", "#ae0000"];

/**
 * Contains helper function related to map functionality
 */
const MapUtils = {
    loadedMaps: [], // array of loaded map data from the server

    /**
     * Loads maps from the server
     */
    loadMaps: function() {
        if (MapUtils.loadedMaps.length > 0) // if the maps were already loaded, do nothing
            return;

        const overlay = showOverlay("Loading maps, please wait...");
        ajaxRequest("GET", Server.address + Server.mapsPath).then(response => {
            hideOverlay(overlay);
            MapUtils.loadedMaps = JSON.parse(response);

            const previewContainer = document.querySelector("#play .map-preview-container");

            // for each loaded map
            MapUtils.loadedMaps.forEach(map => {
                // only if the map is valid
                if (MapUtils.verifyMap(map.data)) {
                    // create the preview element and add it to the document
                    const previewElement = document.createElement("div");
                    previewElement.classList.add("map-preview");
                    previewElement.appendChild(MapUtils.generateMapPreviewSvg(map.data));
                    previewElement.addEventListener("click", () => GameHelpers.startGame(map));

                    previewContainer.appendChild(previewElement);
                }
            });
        }).catch(error => {
            // error occurred when loading the maps from the server (retry will require page reload)
            hideOverlay(overlay);
            MapUtils.loadedMaps = [null]; // to prevent retries on map reload
            showNotification("Failed to retrieve maps from the server");

            // show the element with a persistent and more detailed error description
            document.querySelector("#play div[data-game-state='map-select'] div.map-preview-container > p").style.display = "block";
        });
    },

    /**
     * Creates a "map object" - an array of numbers where index represents the map position and value is MapObject value
     * for given tile
     * @param mapData source map data
     * @returns {number[]} map object generated from given map data
     */
    mapDataToMapObject: function(mapData) {
        // initially fill all the tiles with FLOOR
        const mapObjects = Array.apply(null, Array(mapData.width * mapData.height)).map(() => MapObject.FLOOR);
        mapData.walls.forEach(position => mapObjects[position] = MapObject.WALL); // replace FLOOR with WALL where needed
        mapData.crates.forEach(position => mapObjects[position] = MapObject.CRATE); // replace FLOOR with CRATE where needed
        // note: player and target tiles are handled separately

        // return the generated map object
        return mapObjects;
    },

    /**
     * Creates a map preview svg element from given mapData
     * @param mapData mapData from which the map preview will be generated
     * @returns {HTMLElement} map preview svg element
     */
    generateMapPreviewSvg: function(mapData) {
        const svg = document.createElementNS(w3svg, "svg"); // svg element

        // viewBox needs to be set to allow the svg to scale properly - tiles this preview generates have a base size
        // of 10*10
        svg.setAttributeNS(null, "viewBox", `0 0 ${10 * mapData.width} ${10 * mapData.height}`);

        // for each map tile
        for (let i=0; i<mapData.width * mapData.height; i++) {
            let fill = null;

            // determine appropriate tile color
            if (i === mapData.player) {
                fill = MapObjectColor[MapObject.PLAYER];
            }
            else if (mapData.targets.includes(i)) {
                fill = MapObjectColor[MapObject.TARGET]
            }
            else if (mapData.crates.includes(i)) {
                fill = MapObjectColor[MapObject.CRATE]
            }
            else if (mapData.walls.includes(i)) {
                fill = MapObjectColor[MapObject.WALL]
            }

            // don't add empty tiles to the main svg for performance reasons
            if (fill !== null) {
                svg.appendChild(createSvgRect(i % mapData.width * 10, Math.floor(i/mapData.width) * 10, 10, 10, fill));
            }
        }

        // return the generated svg element
        return svg;
    },

    /**
     * Verifies that the provided mapData is valid mapData
     * @param mapData mapData to be verified
     * @returns {boolean} true if the given mapData are valid mapData
     */
    verifyMap(mapData) {
        try {
            // invalid map dimensions
            if (mapData.width < 1 || mapData.height < 1 || isNaN(mapData.width) || isNaN(mapData.height))
                return false;

            // invalid layout
            if (0 === mapData.targets.length || // no targets
                mapData.player === undefined || // no player
                mapData.crates.length !== mapData.targets.length // inconsistent number of targets and crates
            ) {
                return false;
            }

            const bounds = mapData.width * mapData.height;

            const outOfBoundsFilterFun = item => item >= bounds || item < 0 || isNaN(item);

            // invalid player position
            if (outOfBoundsFilterFun(parseInt(mapData.player)))
                return false;

            // filter map objects by their position
            const outOfBoundsObjects = mapData.walls.filter(outOfBoundsFilterFun)
             .concat(
                mapData.targets.filter(outOfBoundsFilterFun)
            ).concat(
                mapData.crates.filter(outOfBoundsFilterFun)
            );

            // if there was any object out of bounds
            if (outOfBoundsObjects.length > 0)
                return false;
        }
        catch (e) {
            // any unspecified error ie. nonexistent (=missing) property
            return false;
        }

        // no error occurred
        return true;
    }
};

class SokobanMap {
    /**
     * Transforms map position to map coordinates
     * @param position position to be transformed
     * @returns {{x: number, y: number}} map coordinates of given position
     */
    transformPositionToCoords(position) {
        /**
         * @name MapCoordinates
         */
        return {
            x: position % this._width,
            y: Math.floor(position / this._width)
        }
    }

    /**
     * Transforms map coordinates to map position
     * @param x {number} x coordinate
     * @param y {number} y coordinate
     * @returns {number} map position of given coordinates
     */
    transformCoordsToPosition(x, y) {
        return y * this._width + x;
    }

    /**
     * Returns all renderable objects that constitute this map instance
     * @returns {GridRenderable[]} array of renderable objects this map is comprised of
     */
    getRenderableObjects() {
        // array of tiles that have special renderable but still need floor tile rendered underneath
        const floorAppends = [];

        // array of target tiles to be rendered - need to be separated because of layering and also because it's saved
        // in a different array that the rest of the map objects
        const targetAppends = this._targets.map(target => {
            const coords = this.transformPositionToCoords(target);
            return new GridRenderable(Resources.Map.target.resource, coords.x, coords.y);
        });

        // array of other objects to be rendered
        const objects = this._mapObjects.map((object, position) => {
            const coords = this.transformPositionToCoords(position); // calculate the object coordinates
            let floorTile = new GridRenderable(Resources.Map.floor.resource, coords.x, coords.y); // floor tile renderable for current position
            let objectRenderable = null; // object renderable for current position

            // test if the object has a special renderable
            switch (object) {
                case MapObject.WALL: objectRenderable = new GridRenderable(Resources.Map.wall.resource, coords.x, coords.y); break;
                case MapObject.CRATE: objectRenderable = new GridRenderable(Resources.Map.crate.resource, coords.x, coords.y); break;
            }

            // if the current object doesn't have a special renderable, return floor tile renderable in its place
            if (objectRenderable == null)
                return floorTile;

            // otherwise save the floor tile to append array and return the special renderable
            floorAppends.push(floorTile);
            return objectRenderable;
        });

        // return target tile renderables on top of map object renderables on top of helper floor tile renderables
        return floorAppends.concat(objects).concat(targetAppends);
    }

    /**
     * Handles a player move, doubles as collision checker
     * @param x {number} x coordinate of the starting tile
     * @param y {number} y coordinate of the starting tile
     * @param direction {number} movement direction
     * @param crateMovable {boolean} if true, collision with crate will result in crate movement
     * @returns {boolean} true if a collision occurred and therefore move shouldn't be performed
     */
    handlePlayerMove(x, y, direction, crateMovable = true) {
        // this is a bit of a jesus function, that both checks for collisions and moves crates if needed

        const currentPosition = this.transformCoordsToPosition(x, y); // transform given coordinates to position
        let checkedPosition = -1; // target position (position of which the content will be checked)

        // calculate the checkedPosition
        switch (direction) {
            case Direction.LEFT:
                checkedPosition = currentPosition - 1;

                // out of horizontal bounds
                if (this.transformPositionToCoords(checkedPosition).y !== this.transformPositionToCoords(currentPosition).y)
                    return true;
                break;

            case Direction.RIGHT:
                checkedPosition = currentPosition + 1;

                // out of horizontal bounds
                if (this.transformPositionToCoords(checkedPosition).y !== this.transformPositionToCoords(currentPosition).y)
                    return true;
                break;

            case Direction.UP: checkedPosition = currentPosition - this._width; break;
            case Direction.DOWN: checkedPosition = currentPosition + this._width; break;
        }

        // ACTUAL COLLISION CHECKING LOGIC

        // out of bounds
        if (checkedPosition < 0 || checkedPosition >= this._mapObjects.length)
            return true;

        // collision with wall
        if (this._mapObjects[checkedPosition] === MapObject.WALL)
            return true;

        // collision with crate
        if (this._mapObjects[checkedPosition] === MapObject.CRATE) {
            if (!crateMovable) // if the crate can't be moved, it's a collision
                return true;

            // otherwise try moving the crate

            // run this function again, this time the crate acts as a player and can't move another crate
            const coords = this.transformPositionToCoords(checkedPosition);
            const crateBlocked = this.handlePlayerMove(coords.x, coords.y, direction, false); // this will be true if the crate can't be moved

            // if there was no collision, move the crate
            if (!crateBlocked) {
                let newCratePosition = checkedPosition;

                switch (direction) {
                    case Direction.LEFT: newCratePosition -= 1; break;
                    case Direction.RIGHT: newCratePosition += 1; break;
                    case Direction.UP: newCratePosition -= this._width; break;
                    case Direction.DOWN: newCratePosition += this._width; break;
                }

                // due to the way the mapObjects array works along with the collision detection, no object will be
                // overwritten by the following 2 assignments
                this._mapObjects[checkedPosition] = MapObject.FLOOR; // remove the crate from its old position
                this._mapObjects[newCratePosition] = MapObject.CRATE; // add it to the new position

                // if the crate was moved to a target tile, play "chime"
                if (this._targets.includes(newCratePosition))
                    GameHelpers.playChimeAudio();
            }

            // result for the original collision detection is the same as for the crate collision detection
            return crateBlocked;
        }

        // no collision detected
        return false;
    }

    /**
     * Returns true if the map has been completed (if all crates all on target tiles)
     * @returns {boolean} true if the map has been completed
     */
    checkGameWon() {
        return this._targets.every(target => this._mapObjects[target] === MapObject.CRATE);
    }

    /**
     * Returns map coordinates of the player's start position
     * @returns {MapCoordinates} map coordinates of the player's start position
     */
    getPlayerStartCoords() {
        return this.transformPositionToCoords(this._playerStartPosition);
    }

    /**
     * Constructs a {SokobanMap} from given mapData
     * @param mapData {Object} object with source map data
     */
    constructor(mapData) {
        this._playerStartPosition = mapData.player;

        this._width = mapData.width;
        this._height = mapData.height;
        this._targets = mapData.targets;
        this._mapObjects = MapUtils.mapDataToMapObject(mapData);
    }
}