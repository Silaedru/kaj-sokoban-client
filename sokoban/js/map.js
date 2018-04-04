
const MapObject = {
    FLOOR: 0,
    WALL: 1,
    CRATE: 2,
    TARGET: 3,
    PLAYER: 4
};

const MapObjectColor = ["#ffffff", "#000000", "#9C927A", "#00aecd", "#ae0000"];

const MapUtils = {
    loadedMaps: [],

    loadMaps: function() {
        if (MapUtils.loadedMaps.length > 0)
            return;

        const overlay = showOverlay("Loading maps, please wait...");
        ajaxRequest("GET", Server.address + Server.mapsPath).then(response => {
            hideOverlay(overlay);
            MapUtils.loadedMaps = JSON.parse(response);

            const previewContainer = document.querySelector("#play .map-preview-container");

            MapUtils.loadedMaps.forEach(map => {
                if (MapUtils.verifyMap(map.data)) {
                    const previewElement = document.createElement("div");
                    previewElement.classList.add("map-preview");
                    previewElement.appendChild(MapUtils.generateMapPreviewSvg(map.data));
                    previewElement.addEventListener("click", () => GameHelpers.startGame(map));
                    previewContainer.appendChild(previewElement);
                }
            });
        }).catch(error => {
            hideOverlay(overlay);
            MapUtils.loadedMaps = [null]; // to prevent retries on reloading the maps
            showNotification("Failed to retrieve maps from the server");
        });
    },

    mapDataToMapObject: function(mapData) {
        const mapObjects = Array.apply(null, Array(mapData.width * mapData.height)).map(() => MapObject.FLOOR);
        mapData.walls.forEach(position => mapObjects[position] = MapObject.WALL);
        mapData.crates.forEach(position => mapObjects[position] = MapObject.CRATE);
        return mapObjects;
    },

    generateMapPreviewSvg: function(mapData) {
        const svg = document.createElementNS(w3svg, "svg");

        svg.setAttributeNS(null, "viewBox", `0 0 ${10 * mapData.width} ${10 * mapData.height}`);

        for (let i=0; i<mapData.width * mapData.height; i++) {
            let fill = null;

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

            if (fill !== null) {
                svg.appendChild(createSvgRect(i % mapData.width * 10, Math.floor(i/mapData.width) * 10, 10, 10, fill));
            }
        }

        return svg;
    },

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

            // invalid object position
            const outOfBoundsObjects = mapData.walls.filter(outOfBoundsFilterFun)
             .concat(
                mapData.targets.filter(outOfBoundsFilterFun)
            ).concat(
                mapData.crates.filter(outOfBoundsFilterFun)
            );

            if (outOfBoundsObjects.length > 0)
                return false;
        }
        catch (e) {
            // any unspecified error ie. nonexistent (=missing) property
            return false;
        }

        return true;
    }
};

class SokobanMap {
    transformPositionToCoords(position) {
        return {
            x: position % this._width,
            y: Math.floor(position / this._width)
        }
    }

    transformCoordsToPosition(x, y) {
        return y * this._width + x;
    }

    getRenderableObjects() {
        let pos = 0;

        const floorAppends = [];

        const targetAppends = this._targets.map(target => {
            const coords = this.transformPositionToCoords(target);
            return new GridRenderable(Resources.Map.target.resource, coords.x, coords.y);
        });

        const rtn = this._mapObjects.map(object => {
            const coords = this.transformPositionToCoords(pos++);
            let floorTile = new GridRenderable(Resources.Map.floor.resource, coords.x, coords.y);
            let rtn = null;

            switch (object) {
                case MapObject.WALL: rtn = new GridRenderable(Resources.Map.wall.resource, coords.x, coords.y); break;
                case MapObject.CRATE: rtn =  new GridRenderable(Resources.Map.crate.resource, coords.x, coords.y); break;
            }

            if (rtn == null)
                return floorTile;

            floorAppends.push(floorTile);
            return rtn;
        });

        return floorAppends.concat(rtn).concat(targetAppends);
    }

    //returns true if collision occurred
    handlePlayerMove(x, y, direction, crateMovable = true) {
        const currentPosition = this.transformCoordsToPosition(x, y);
        let checkedPosition = -1;

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


        // out of bounds
        if (checkedPosition < 0 || checkedPosition >= this._mapObjects.length)
            return true;

        // wall
        if (this._mapObjects[checkedPosition] === MapObject.WALL)
            return true;

        // crate
        if (this._mapObjects[checkedPosition] === MapObject.CRATE) {
            if (!crateMovable)
                return true;

            const coords = this.transformPositionToCoords(checkedPosition);
            const crateBlocked = this.handlePlayerMove(coords.x, coords.y, direction, false);

            if (!crateBlocked) {
                let newCratePosition = checkedPosition;

                switch (direction) {
                    case Direction.LEFT: newCratePosition -= 1; break;
                    case Direction.RIGHT: newCratePosition += 1; break;
                    case Direction.UP: newCratePosition -= this._width; break;
                    case Direction.DOWN: newCratePosition += this._width; break;
                }

                this._mapObjects[checkedPosition] = MapObject.FLOOR;
                this._mapObjects[newCratePosition] = MapObject.CRATE;

                if (this._targets.includes(newCratePosition))
                    GameHelpers.playChimeAudio();
            }

            return crateBlocked;
        }

        return false;
    }

    checkGameWon() {
        return this._targets.every(target => this._mapObjects[target] === MapObject.CRATE);
    }

    getPlayerStartCoords() {
        return this.transformPositionToCoords(this._playerStartPosition);
    }

    constructor(mapData) {
        this._playerStartPosition = mapData.player;

        this._width = mapData.width;
        this._height = mapData.height;
        this._targets = mapData.targets;
        this._mapObjects = MapUtils.mapDataToMapObject(mapData);
    }
}